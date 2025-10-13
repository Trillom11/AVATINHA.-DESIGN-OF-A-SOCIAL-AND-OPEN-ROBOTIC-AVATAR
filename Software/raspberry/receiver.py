#!/usr/bin/env python3
import asyncio
import time
import pyaudio
import socketio
from aiortc import RTCPeerConnection, RTCSessionDescription
import av
import numpy as np

# === CONFIG ===
SERVER_URL = "https://avatinha-api.srv.cesga.es"
ID = "520786"

VOLUME = 100         # output gain in percent
MAX_QUEUE = 20       # queue size in audio frames (20 frames ~= 0.4 s)
CATCH_UP_MS = 100    # frames to drop (in ms) when queue is full
MAX_DELAY = 0.15     # max allowed delay in seconds

# === AUDIO OUTPUT SELECTION ===
def find_headphones_output() -> int:
    pa = pyaudio.PyAudio()
    for i in range(pa.get_device_count()):
        info = pa.get_device_info_by_index(i)
        if "Headphones" in info["name"]:
            print(f"[INIT] using output: {info['name']} index {i}")
            return i
    raise RuntimeError("Headphones output not found")

output_index = find_headphones_output()

# === PYAUDIO STREAM ===
RATE = 48000               # match typical WebRTC sample rate
FRAMES_PER_BUFFER = 960    # 20 ms of audio at 48 kHz

pa = pyaudio.PyAudio()
STREAM = pa.open(
    format=pyaudio.paInt16,
    channels=1,
    rate=RATE,
    output=True,
    output_device_index=output_index,
    frames_per_buffer=FRAMES_PER_BUFFER
)

# === SOCKET.IO CLIENT ===
sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("[SOCKET] connected")
    await sio.emit("register", {"role": "camera", "id": ID+"_audio"})
    print("[SOCKET] register sent")

@sio.event
async def disconnect():
    print("[SOCKET] disconnected")

@sio.on("webrtc-offer")
async def on_webrtc_offer(data):
    print("[SOCKET] webrtc-offer received")
    pc = RTCPeerConnection()
    print("[WEBRTC] new RTCPeerConnection created")

    @pc.on("iceconnectionstatechange")
    def on_ice_state():
        print(f"[WEBRTC] ICE state: {pc.iceConnectionState}")

    @pc.on("track")
    def on_track(track):
        print(f"[WEBRTC] track type: {track.kind}")
        if track.kind == "audio":
            asyncio.create_task(play_audio(track))

    # Apply remote description
    await pc.setRemoteDescription(
        RTCSessionDescription(sdp=data["sdp"], type=data["type"])
    )
    print("[WEBRTC] remote description set")

    # Create and send answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await sio.emit(
        "webrtc-answer",
        {"id": ID, "sdp": pc.localDescription.sdp, "type": pc.localDescription.type},
    )
    print("[SOCKET] webrtc-answer sent")

# === AUDIO HANDLING ===
async def play_audio(track):
    print("[AUDIO] play_audio started")
    resampler = av.audio.resampler.AudioResampler(
        format="s16", layout="mono", rate=RATE
    )
    queue = asyncio.Queue(maxsize=MAX_QUEUE)

    async def reader():
        print("[AUDIO] reader started")
        while True:
            frame = await track.recv()
            if queue.full():
                # Drop enough frames to remove CATCH_UP_MS of backlog
                drop_count = int(CATCH_UP_MS / 20)
                for _ in range(drop_count):
                    if not queue.empty():
                        queue.get_nowait()
                print("[AUDIO] queue full, dropping old frames")
            await queue.put(frame)

    async def player():
        print("[AUDIO] player started")
        first_pts = None
        start_time = None
        while True:
            frame = await queue.get()
            # Delay control (optional but recommended)
            if frame.pts is not None:
                if first_pts is None:
                    first_pts = frame.pts
                    start_time = time.perf_counter()
                media_time = (frame.pts - first_pts) * frame.time_base
                wall_time = time.perf_counter() - start_time
                if wall_time - media_time > MAX_DELAY:
                    # Too much delay, skip this frame
                    continue

            for fr in resampler.resample(frame):
                samples = fr.to_ndarray().astype(np.int16)
                amplified = np.clip(
                    samples * ((VOLUME / 100) * 2.5), -32768, 32767
                ).astype(np.int16)
                STREAM.write(amplified.tobytes())

    asyncio.create_task(reader())
    asyncio.create_task(player())

# === MAIN ===
async def main():
    print("[MAIN] connecting to signaling server...")
    await sio.connect(SERVER_URL, transports=["websocket"])
    print("[MAIN] connected, waiting for events...")
    await sio.wait()

if __name__ == "__main__":
    print("[MAIN] starting event loop")
    asyncio.run(main())
