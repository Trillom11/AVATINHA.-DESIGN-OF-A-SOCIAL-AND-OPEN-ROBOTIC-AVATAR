#!/usr/bin/env python3
# envio_audio_rpi.py
# Transmite solo audio via WebRTC desde microfono USB (arecord) a servidor Socket.IO

import asyncio
import socketio
import ssl
import aiohttp
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack, RTCIceCandidate
from aiortc.mediastreams import AudioFrame
import mariadb
import subprocess
import hashlib
import time
from fractions import Fraction
import numpy as np
import signal
import os
from aiortc.sdp import candidate_from_sdp
import av
import logging
import socket

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")

# ---------- utilidades serial y codigo ----------
def get_serial():
    try:
        cpuinfo = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
        for line in cpuinfo.split('\n'):
            if line.startswith('Serial'):
                return line.split(':')[1].strip()
    except Exception:
        pass
    return '0000000000000000'

def generar_codigo(serial):
    h = hashlib.sha256(serial.encode()).hexdigest()
    return str(int(h, 16) % 1000000).zfill(6)

def verificar_codigo_en_bd(serial, codigo):
    try:
        con = mariadb.connect(host='192.168.130.64', user='root',
                              password='contrasena', database='vinculacion_raspberry')
        cur = con.cursor()
        cur.execute('SELECT codigo_vinculacion FROM dispositivos WHERE serial=? AND codigo_vinculacion=?',
                    (serial, codigo))
        res = cur.fetchone()
        con.close()
        return res[0] if res else None
    except mariadb.Error as e:
        print('Error MariaDB:', e)
        return None

# ---------- pista de audio capturada con arecord ----------
def enviar_estado_micro(estado):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("127.0.0.1", 5050))
            s.sendall(estado.encode())
    except Exception as e:
        print(f"[COMUNICACION] Error al enviar estado: {e}")

estado_altavoz_historial = []

class MicrofonoArecordTrack(MediaStreamTrack):
    kind = 'audio'

    def __init__(self, rate=48000):
        super().__init__()
        self.rate = rate
        self.channels = 1
        self.block = 480  # 10 ms
        self.ts = 0
        self.estado_actual = None
        self.ultimo_sonido = time.time()
        self.energias = []

        self.proc = subprocess.Popen(
            ['parec', '-d', 'mic_aec', '--format=s16le', '--rate=48000',
             '--channels=1', '--latency-msec=5'],
            stdout=subprocess.PIPE,
            bufsize=self.block * 2
        )
        logging.info('parec lanzado en mic_aec con %d muestras', self.block)

    async def recv(self):
        global estado_altavoz_historial

        raw = await asyncio.get_event_loop().run_in_executor(
            None, self.proc.stdout.read, self.block * 2
        )
        if not raw:
            raise EOFError('sin datos de parec')

        volumen = np.frombuffer(raw, dtype=np.int16)
        energia = np.sqrt(np.mean(volumen.astype(np.float32)**2))

        clasificacion = "activo" if energia > 1250 else "inactivo"
        self.energias.append(clasificacion)
        if len(self.energias) > 100:
            self.energias.pop(0)

        activos = self.energias.count("activo")
        inactivos = self.energias.count("inactivo")
        total = len(self.energias)

        if total == 100:
            if activos / total >= 0.35 and self.estado_actual != "activo":
                enviar_estado_micro("activo")
                print("🟢 Microfono ACTIVO")
                self.estado_actual = "activo"
            elif inactivos / total >= 0.85 and self.estado_actual != "inactivo":
                enviar_estado_micro("inactivo")
                print("⚪ Microfono NO activo")
                self.estado_actual = "inactivo"

        # Evaluar historial del altavoz recibido
        decision = "inactivo"
        num_pruebas = 100
        if len(estado_altavoz_historial) == num_pruebas:
            num_activos = estado_altavoz_historial.count("activo")
            if num_activos / num_pruebas >= 0.35:
                decision = "activo"
            if (num_activos - num_pruebas) / num_pruebas >= 0.85:
                decision = "inactivo"

        frame = av.AudioFrame(format='s16', layout='mono', samples=self.block)
        if decision == "activo":
            frame.planes[0].update(b'\x00' * (self.block * 2))
        else:
            frame.planes[0].update(raw)

        frame.sample_rate = self.rate
        frame.pts = self.ts
        frame.time_base = Fraction(1, self.rate)
        self.ts += self.block
        return frame

# ---------- variables globales ----------
pcs = {}
sio = None

async def cerrar_todo():
    for pc in pcs.values():
        await pc.close()
    print('RTCPeerConnections cerradas')

# ---------- main async ----------
async def main():
    global sio
    asyncio.create_task(estado_altavoz())
    serial = get_serial()
    codigo = generar_codigo(serial)
    print('Serial:', serial)
    print('Codigo determinista:', codigo)

    codigo_bd = verificar_codigo_en_bd(serial, codigo)
    if not codigo_bd:
        print('Codigo no registrado. programa abortado.')
        return

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    session = aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_ctx))
    sio = socketio.AsyncClient(http_session=session)

    @sio.event
    async def connect():
        print('Conectado a servidor de señalizacion como', codigo_bd)
        await sio.emit("register", {"role": "camera", "id": codigo_bd + "_audio"})

    @sio.on('offer')
    async def on_offer(data):
        print('Oferta recibida de', data['id'])
        pc = RTCPeerConnection()
        pcs[data['id']] = pc

        pc.addTrack(MicrofonoArecordTrack())

        @pc.on('icecandidate')
        async def ice(ev):
            if ev.candidate:
                await sio.emit('candidate', {
                    'id': data['id'],
                    'candidate': ev.candidate.candidate,
                    'sdpMid': ev.candidate.sdpMid,
                    'sdpMLineIndex': ev.candidate.sdpMLineIndex
                })
                print('ICE local enviado')

        @pc.on('connectionstatechange')
        async def _state():
            logging.info('estado PC --> %s', pc.connectionState)

        offer = RTCSessionDescription(sdp=data['sdp'], type=data['type'])
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await sio.emit('answer', {
            'id': data['id'],
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        })
        print('Respuesta SDP de audio enviada')

    @sio.on('candidate')
    async def on_candidate(data):
        pc = pcs.get(data['id'])
        if not pc:
            print('ICE recibido sin pc')
            return

        cand_str = data.get('candidate', '')
        if not cand_str:
            await pc.addIceCandidate(None)
            print('Fin de candidatos remoto')
            return

    try:
        await sio.connect('https://avatinha-api.srv.cesga.es', transports=['websocket'])
        await sio.wait()
    except Exception as e:
        print('Error principal:', repr(e))
    finally:
        await cerrar_todo()
        await session.close()

async def procesar_estado(reader, writer):
    global estado_altavoz_historial
    data = await reader.read(100)
    estado = data.decode().strip()

    if estado in ["activo", "inactivo"]:
        estado_altavoz_historial.append(estado)
        if len(estado_altavoz_historial) > 100:
            estado_altavoz_historial.pop(0)
        print(f"🔈 Altavoz recibido: {estado.upper()}")
    else:
        print(f"❓ Estado desconocido: {estado}")

    writer.close()
    await writer.wait_closed()

async def estado_altavoz():
    server = await asyncio.start_server(procesar_estado, "127.0.0.1", 5051)
    print("📡 Esperando mensajes del micro en puerto 5051...")
    await server.serve_forever()

# ---------- control ctrl+c ----------
def sigint_handler(sig, frame):
    print('Ctrl+C recibido. cerrando...')
    asyncio.get_event_loop().stop()

if __name__ == '__main__':
    enviar_estado_micro("inactivo")
    signal.signal(signal.SIGINT, sigint_handler)
    asyncio.run(main())
