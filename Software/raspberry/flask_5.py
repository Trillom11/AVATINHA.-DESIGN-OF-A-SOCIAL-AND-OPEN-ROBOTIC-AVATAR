import math
import time
import threading
import socketio
import pigpio
from luma.core.interface.serial import spi, noop
from luma.led_matrix.device import max7219

from emociones_matriz2 import (
    mostrar_ojos_base,
    mover_pupila_realista_parpadeo,
    transicion_emocion,
)

# ---------- configuracion ----------
SERVER_URL = "https://avatinha-api.srv.cesga.es"
ID = "robot_"+"520786"

MG996R_PIN = 18
FS5103R_PIN = 12
NEUTRO_X = 1477
NEUTRO_Y = 1553

# Nuevas variables para los límites de pulso de cada servo
# Define el rango máximo de desviación para el servo X desde su neutro
MAX_DELTA_X = 40
# Define el rango máximo de desviación para el servo Y desde su neutro
MAX_DELTA_Y = 60

# ---------- hardware ----------
serial_a = spi(port=0, device=0, gpio=noop())
serial_b = spi(port=0, device=1, gpio=noop())
matriz_izq = max7219(serial_a, cascaded=1, block_orientation=0)
matriz_der = max7219(serial_b, cascaded=1, block_orientation=0)

pi = pigpio.pi()
if not pi.connected:
    raise RuntimeError("pigpiod no esta corriendo")

pi.set_mode(MG996R_PIN, pigpio.OUTPUT)
pi.set_mode(FS5103R_PIN, pigpio.OUTPUT)
pi.set_PWM_frequency(MG996R_PIN, 50)
pi.set_PWM_frequency(FS5103R_PIN, 50)

def actualizar_servos(angle, force):
    rad = math.radians(angle)
    dx = math.cos(rad) * force
    dy = math.sin(rad) * force

    # Calculamos los pulsos usando los deltas específicos para cada servo
    pulse_x = max(1000, min(2000, NEUTRO_X + dx * MAX_DELTA_X))
    pulse_y = max(1000, min(2000, NEUTRO_Y + dy * MAX_DELTA_Y))

    print(f"Servo X={pulse_x:.0f}  Servo Y={pulse_y:.0f}")
    pi.set_servo_pulsewidth(MG996R_PIN, pulse_x)
    pi.set_servo_pulsewidth(FS5103R_PIN, pulse_y)

# ---------- Socket.IO ----------
sio = socketio.Client(reconnection=True)

emocion_actual = None
emocion_lock = threading.Lock()

@sio.event
def connect():
    print("Conectado al servidor")
    sio.emit("register", {"role": "camera", "id": ID})

@sio.on("joystick")
def on_joystick(data):
    angle = data.get("angle", 0)
    force = data.get("force", 0)
    actualizar_servos(angle, force)

@sio.on("emocion")
def on_emocion(data):
    global emocion_actual
    nombre = data.get("emocion", "")
    print(f"Emocion recibida: {nombre}")
    with emocion_lock:
        emocion_actual = nombre

@sio.on("audio-stream")
def on_audio_stream(data):
    with open("audio_recibido.ogg", "wb") as f:
        f.write(data)
    print("Audio guardado")

# ---------- gestion hilo idle ----------
idle_stop = None
idle_thread = None

def iniciar_idle():
    global idle_stop, idle_thread
    idle_stop = threading.Event()
    idle_thread = threading.Thread(
        target=mover_pupila_realista_parpadeo,
        args=(matriz_izq, matriz_der, idle_stop),
        daemon=True,
    )
    idle_thread.start()

def detener_idle():
    global idle_stop, idle_thread
    if idle_stop is not None:
        idle_stop.set()
    if idle_thread is not None:
        idle_thread.join(timeout=2)
    idle_stop = None
    idle_thread = None

@sio.event
def disconnect():
    print("Desconectado del servidor")
    detener_idle()
    pi.set_servo_pulsewidth(MG996R_PIN, 0)
    pi.set_servo_pulsewidth(FS5103R_PIN, 0)
    pi.stop()

# ---------- main ----------
if __name__ == "__main__":
    print("Iniciando programa")
    mostrar_ojos_base(matriz_izq, matriz_der)
    iniciar_idle()

    try:
        sio.connect(SERVER_URL, wait_timeout=20)

        while True:
            # comprueba si llego una emocion
            with emocion_lock:
                emocion = emocion_actual
                emocion_actual = None

            if emocion:
                detener_idle()
                transicion_emocion(emocion, matriz_izq, matriz_der)
                mostrar_ojos_base(matriz_izq, matriz_der)
                iniciar_idle()

            time.sleep(0.05)

    except KeyboardInterrupt:
        print("Interrupcion de teclado")
    finally:
        detener_idle()
        sio.disconnect()