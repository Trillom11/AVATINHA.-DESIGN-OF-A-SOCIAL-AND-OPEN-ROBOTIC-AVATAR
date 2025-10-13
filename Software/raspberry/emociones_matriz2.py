# emociones_matriz.py
# Funciones de dibujo y animacion para las matrices MAX7219
# TODO en este archivo esta sin tildes ni letra n con tilde

import time
import random
from threading import Event
from luma.core.render import canvas
from emociones import *  # importa todas las matrices definidas por el usuario

# ojo base (pupila centrada)
ojo_base = [
    "00111100",
    "01111110",
    "01111110",
    "01111110",
    "01111110",
    "01111110",
    "01111110",
    "00111100",
]

# ---------- utilidades de dibujo ----------

def dibujar(patron, matriz):
    with canvas(matriz) as draw:
        for y, fila in enumerate(patron):
            for x, bit in enumerate(fila):
                if bit == "1":
                    draw.point((x, y), fill="white")

def mostrar_ojos_base(matriz_izq, matriz_der):
    dibujar(ojo_base, matriz_izq)
    dibujar(ojo_base, matriz_der)

def generar_fases_parpadeo(ojo_abierto):
    fase_list = []
    for i in range(1, 5):
        fase = ["00000000" for _ in range(8)]
        for j in range(i, 8 - i):
            fase[j] = ojo_abierto[j]
        fase_list.append(fase)
    return fase_list + fase_list[::-1]

# ---------- bucle idle (pupila + parpadeo) ----------

def mover_pupila_realista_parpadeo(matriz_izq, matriz_der, stop_event: Event):
    x, y = random.randint(1, 5), random.randint(1, 5)
    direcciones = [(-1, -1), (0, -1), (1, -1),
                   (-1,  0),          (1,  0),
                   (-1,  1), (0,  1), (1,  1)]
    dx, dy = random.choice(direcciones)

    proximo_parp = time.monotonic() + random.uniform(2.5, 5.0)
    pesos = [40, 35, 30, 25, 20, 15, 10]
    movs_max = random.choices(range(2, 9), weights=pesos, k=1)[0]
    hechos = 0

    while not stop_event.is_set():
        ojo_mod = [list(f) for f in ojo_base]
        for i in range(2):
            for j in range(2):
                fila = y + i
                col = x + j
                if 0 <= fila < 8 and 0 <= col < 8:
                    ojo_mod[fila][col] = "0"
        ojo_mod = ["".join(f) for f in ojo_mod]

        dibujar(ojo_mod, matriz_izq)
        dibujar(ojo_mod, matriz_der)
        time.sleep(0.1)

        # parpadeo
        if time.monotonic() >= proximo_parp:
            for fase in generar_fases_parpadeo(ojo_mod):
                dibujar(fase, matriz_izq)
                dibujar(fase, matriz_der)
                time.sleep(0.1)
                if stop_event.is_set():
                    break
            proximo_parp = time.monotonic() + random.uniform(2.5, 5.0)

        # pausas aleatorias
        if hechos >= movs_max:
            pausa = random.uniform(3, 6)
            for _ in range(int(pausa / 0.1)):
                if stop_event.is_set():
                    break
                time.sleep(0.1)
            hechos = 0
            movs_max = random.choices(range(2, 9), weights=pesos, k=1)[0]
            continue

        # siguiente posicion pupila
        nx, ny = x + dx, y + dy
        if 1 <= nx <= 5 and 1 <= ny <= 5:
            x, y = nx, ny
            hechos += 1
        else:
            dx, dy = random.choice(direcciones)

# ---------- transicion de emociones ----------

def _buscar_movimientos(nombre):
    """Devuelve lista ordenada de (paso, patron) para frames de movimiento."""
    movs = []
    pref = f"{nombre}_movimiento"
    for var in globals():
        if var.startswith(pref) and var[len(pref):].isdigit():
            paso = int(var[len(pref):])
            movs.append((paso, globals()[var]))
    movs.sort()
    return movs

def transicion_emocion(nombre, matriz_izq, matriz_der, pausa=0.1, espera=5):
    fases_izq, fases_der, fases_comunes = [], [], []

    # recolecta fases
    for var in globals():
        if var.startswith(nombre):
            suf = var[len(nombre):]
            if suf.isdigit():
                fases_comunes.append((int(suf), globals()[var]))
            elif len(suf) == 2 and suf[1].isdigit():
                ojo, paso = suf[0], int(suf[1])
                if ojo == "1":
                    fases_izq.append((paso, globals()[var]))
                elif ojo == "2":
                    fases_der.append((paso, globals()[var]))

    if not fases_comunes and not fases_izq and not fases_der:
        print(f"No se encontraron fases para {nombre}")
        return

    movimientos = _buscar_movimientos(nombre)

    # --- caso fases comunes ---
    if fases_comunes:
        fases_comunes.sort()
        # ida
        for _, p in fases_comunes:
            dibujar(p, matriz_izq)
            dibujar(p, matriz_der)
            time.sleep(pausa)
        # loop de movimiento (si existe)
        if movimientos:
            t0 = time.monotonic()
            while time.monotonic() - t0 < espera:
                for _, p in movimientos:
                    dibujar(p, matriz_izq)
                    dibujar(p, matriz_der)
                    time.sleep(0.21)
        else:
            time.sleep(espera)
        # vuelta
        for _, p in reversed(fases_comunes):
            dibujar(p, matriz_izq)
            dibujar(p, matriz_der)
            time.sleep(pausa)
    # --- caso fases separadas por ojo ---
    else:
        fases_izq.sort()
        fases_der.sort()
        max_p = max(len(fases_izq), len(fases_der))
        if len(fases_izq) < max_p:
            fases_izq.extend([fases_izq[-1]] * (max_p - len(fases_izq)))
        if len(fases_der) < max_p:
            fases_der.extend([fases_der[-1]] * (max_p - len(fases_der)))
        # ida
        for i in range(max_p):
            dibujar(fases_izq[i][1], matriz_izq)
            dibujar(fases_der[i][1], matriz_der)
            time.sleep(pausa)
        # loop movimiento
        if movimientos:
            t0 = time.monotonic()
            while time.monotonic() - t0 < espera:
                for _, p in movimientos:
                    dibujar(p, matriz_izq)
                    dibujar(p, matriz_der)
                    time.sleep(0.21)
        else:
            time.sleep(espera)
        # vuelta
        for i in reversed(range(max_p)):
            dibujar(fases_izq[i][1], matriz_izq)
            dibujar(fases_der[i][1], matriz_der)
            time.sleep(pausa)
