#!/usr/bin/env python3
# stream_av_rpi.py
# Envía video via WebRTC a un servidor Socket.IO

import asyncio
import logging
import ssl
import signal
import os
import subprocess
import hashlib
import time
from fractions import Fraction

import aiohttp
import socketio
import mariadb
import numpy as np  # Keep if picamera2 returns numpy array
from aiortc import (
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    MediaStreamTrack,
)
# from aiortc.mediastreams import AudioFrame # REMOVED: Not sending audio
from av import VideoFrame
from picamera2 import Picamera2

# ---------- utilidades serial y codigo ----------


def get_serial() -> str:
    try:
        cpuinfo = subprocess.check_output(["cat", "/proc/cpuinfo"]).decode()
        for line in cpuinfo.split("\n"):
            if line.startswith("Serial"):
                return line.split(":")[1].strip()
    except Exception:
        pass
    return "0000000000000000"


def generar_codigo(serial: str) -> str:
    h = hashlib.sha256(serial.encode()).hexdigest()
    return str(int(h, 16) % 1_000_000).zfill(6)


def verificar_codigo_en_bd(serial: str, codigo: str) -> str | None:
    try:
        con = mariadb.connect(
            host="192.168.130.64",
            user="root",
            password="contrasena",
            database="vinculacion_raspberry",
        )
        cur = con.cursor()
        cur.execute(
            "SELECT codigo_vinculacion FROM dispositivos WHERE serial=? AND codigo_vinculacion=?",
            (serial, codigo),
        )
        res = cur.fetchone()
        con.close()
        return res[0] if res else None
    except mariadb.Error as e:
        print("Error MariaDB:", e)
        return None


# ---------- pistas de captura ----------

# REMOVED: No longer need MicrofonoArecordTrack as we're not sending audio


class CameraStreamTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, picam: Picamera2) -> None:
        super().__init__()
        self.picam = picam
        self.start_time = time.time()
        self.delay = 1 / 30  # 30 FPS aproximado

    async def recv(self):
        frame_np = self.picam.capture_array("main")
        now = time.time()
        pts = int((now - self.start_time) * 90_000)
        time_base = Fraction(1, 90_000)

        # convertir BGR >> RGB
        frame_rgb = frame_np[:, :, ::-1]
        vf = VideoFrame.from_ndarray(frame_rgb, format="rgb24")
        vf.pts = pts
        vf.time_base = time_base

        await asyncio.sleep(self.delay)
        return vf


# ---------- globales ----------

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s"
)

pcs: dict[str, RTCPeerConnection] = {}
camera: Picamera2 | None = None
sio: socketio.AsyncClient | None = None
ROBOT_ID_PREFIX = "robot_"  # New prefix for IDs


async def cerrar_todo():
    for pc in pcs.values():
        await pc.close()
    if camera:
        camera.close()
        print("Camara cerrada")


# ---------- main ----------


async def main():
    global camera, sio

    serial = get_serial()
    codigo = generar_codigo(serial)
    # The ID sent to the server will now be prefixed
    robot_full_id = f"{ROBOT_ID_PREFIX}{codigo}"
    print("Serial:", serial)
    print("Codigo determinista:", codigo)
    print("ID del robot para el servidor:", robot_full_id)

    codigo_bd = verificar_codigo_en_bd(serial, codigo)
    if not codigo_bd:
        print("Codigo no registrado. Programa abortado.")
        return

    # iniciar camara antes de conectar
    camera = Picamera2()
    print("Iniciando camara...")
    config = camera.create_video_configuration(
        main={"format": "RGB888", "size": (640, 480)}
    )
    camera.configure(config)
    camera.start()
    print("Camara iniciada correctamente")

    # cliente Socket.IO
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    session = aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_ctx))
    sio = socketio.AsyncClient(http_session=session)

    @sio.event
    async def connect():
        print("Conectado al servidor como", robot_full_id)  # Use the new ID
        await sio.emit("register", {"role": "camera", "id": robot_full_id})  # Use the new ID

    @sio.event
    async def disconnect():
        print("Desconectado del servidor")
        await cerrar_todo()

    @sio.event
    async def connect_error(data):
        print("Error de conexion:", data)

    @sio.on("offer")
    async def on_offer(data):
        # We need to ensure the ID received matches what we expect or handle it
        # For simplicity, we'll assume the 'id' in data is the viewer's ID
        # and we use our `robot_full_id` when emitting back.
        viewer_id = data["id"]
        print(f"Oferta recibida de {viewer_id}")
        pc = RTCPeerConnection()
        pcs[viewer_id] = pc  # Store by viewer ID, as they initiated

        pc.addTrack(CameraStreamTrack(camera))
        # REMOVED: pc.addTrack(MicrofonoArecordTrack()) - Not sending audio

        @pc.on("icecandidate")
        async def on_local_ice(ev):
            if ev.candidate:
                await sio.emit(
                    "candidate",
                    {
                        "id": viewer_id,  # Send candidate back to the specific viewer
                        "candidate": ev.candidate.candidate,
                        "sdpMid": ev.candidate.sdpMid,
                        "sdpMLineIndex": ev.candidate.sdpMLineIndex,
                    },
                )

        @pc.on("connectionstatechange")
        async def on_state_change():
            logging.info("PC estado %s", pc.connectionState)
            if pc.connectionState == "disconnected" or pc.connectionState == "failed":
                print(f"Conexión con {viewer_id} terminada. Limpiando...")
                if viewer_id in pcs:
                    await pcs[viewer_id].close()
                    del pcs[viewer_id]

        offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await sio.emit(
            "answer",
            {
                "id": viewer_id,  # Send answer back to the specific viewer
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type,
            },
        )
        print(f"Respuesta SDP enviada a {viewer_id}")

        # lanza flask motor despues de 5 s
        await asyncio.sleep(5)
        try:
            subprocess.run(
                [
                    "tmux",
                    "new-session",
                    "-d",
                    "-s",
                    "flask",
                    "source ~/Desktop/avatinha/bin/activate && sudo pigpiod && python3 ~/flask_5.py",
                ],
                check=True,  # Raise an exception if the command fails
            )
            print("flask_5.py lanzado en tmux (tmux attach -t flask)")
        except subprocess.CalledProcessError as e:
            print(f"Error al iniciar flask_5.py en tmux: {e}")
            print(f"Salida del error: {e.stderr}")
            # Potentially add more error handling here, like retrying or exiting


    @sio.on("candidate")
    async def on_remote_candidate(data):
        pc = pcs.get(data["id"])
        if not pc:
            print(f"ICE recibido para ID desconocido: {data['id']}")
            return

        cand_str = data.get("candidate", "").strip()
        if not cand_str:
            # end-of-candidates
            await pc.addIceCandidate(None)
            return

        try:
            cand = RTCIceCandidate(
                candidate=data["candidate"],
                sdpMid=data["sdpMid"],
                sdpMLineIndex=data["sdpMLineIndex"],
            )
            await pc.addIceCandidate(cand)
        except Exception as e:
            print("Error al agregar candidate:", e)
            print("Datos del candidato:", data)

    # Handle joystick and emotion events as before, but only for the specific robot_full_id
    @sio.on("joystick")
    async def on_joystick(data):
        if data.get("id") == robot_full_id:  # Ensure event is for this robot
            # Your joystick handling logic here
            # print(f"Joystick data for {data['id']}: Angle={data['angle']}, Force={data['force']}")
            pass  # Implement your motor control here

    @sio.on("emocion")
    async def on_emocion(data):
        if data.get("id") == robot_full_id:  # Ensure event is for this robot
            print(f"Emocion '{data['emocion']}' recibida para {data['id']}")
            # Your emotion handling logic here (e.g., display on robot screen)

    # Add listeners for audio-control, though we're not sending audio
    # This might be useful if you later want to re-enable audio or acknowledge commands
    @sio.on("audio-control")
    async def on_audio_control(data):
        if data.get("id") == robot_full_id:  # Ensure event is for this robot
            print(f"Control de audio recibido: {data['accion']} para {data['id']}")
            # You might want to log this or perform actions if you re-enable audio

    try:
        await sio.connect("https://avatinha-api.srv.cesga.es", transports=["websocket"])
        await sio.wait()
    except Exception as e:
        print("Error principal:", e)
    finally:
        await cerrar_todo()
        await session.close()
        print("Script finalizado")


def sigint_handler(sig, frame):
    print("Ctrl+C recibido. Cerrando...")
    # This will stop the asyncio loop gracefully
    asyncio.get_event_loop().call_soon_threadsafe(asyncio.get_event_loop().stop)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, sigint_handler)
    try:
        asyncio.run(main())
    except RuntimeError as e:
        if "Event loop is running" not in str(e):
            raise