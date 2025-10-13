import RPi.GPIO as GPIO
from time import sleep, time
import curses

# Pines
MOTOR1_PIN = 18  # Eje X
MOTOR2_PIN = 12  # Eje Y

GPIO.setmode(GPIO.BCM)
GPIO.setup(MOTOR1_PIN, GPIO.OUT)
GPIO.setup(MOTOR2_PIN, GPIO.OUT)

pwm1 = GPIO.PWM(MOTOR1_PIN, 50)
pwm2 = GPIO.PWM(MOTOR2_PIN, 50)
pwm1.start(0)
pwm2.start(0)

duty1 = 7.5
duty2 = 7.5
fase = 1

# Incrementos ajustables para motor 2
ajuste_incremento2_pos = 0.00
ajuste_incremento2_neg = 0.00

# Tiempos y diferencias globales
tiempos_motor1_pos = []
tiempos_motor2_pos = []
diferencias_pos = []

tiempos_motor1_neg = []
tiempos_motor2_neg = []
diferencias_neg = []

def set_duty(pwm, duty, duracion=0.5):
    pwm.ChangeDutyCycle(duty)
    sleep(duracion)
    pwm.ChangeDutyCycle(0)

def mostrar_encabezado(stdscr, titulo):
    stdscr.clear()
    stdscr.addstr(0, 0, "="*52)
    stdscr.addstr(1, 0, f"=   {titulo.center(46)}   =")
    stdscr.addstr(2, 0, "="*52)

def medir_parte(stdscr, parte, incremento_base, ajuste_incremento2, tiempos_m1, tiempos_m2, diferencias, duty1, duty2, modo):
    mostrar_encabezado(stdscr, f"FASE {modo} - PARTE {parte+1}")
    incremento1 = incremento_base
    incremento2 = incremento_base + ajuste_incremento2
    stdscr.addstr(4, 0, f"💡 Incremento Motor 1: {incremento1:.2f} | Motor 2: {incremento2:.2f}")
    stdscr.addstr(6, 0, "➡️  Posiciona MOTOR 1 con 'a'/'d'. ESPACIO cuando este listo.")
    stdscr.refresh()

    # Posiciona Motor 1
    while True:
        key = stdscr.getch()
        if key == ord('a'):
            pwm1.ChangeDutyCycle(duty1 - 0.1)
        elif key == ord('d'):
            pwm1.ChangeDutyCycle(duty1 + 0.1)
        elif key == ord(' '):
            pwm1.ChangeDutyCycle(0)
            break
        sleep(0.05)

    # Medir Motor 1
    stdscr.addstr(8, 0, "Pulsa 'a' para INICIAR MOTOR 1, 'z' para PARAR.")
    stdscr.refresh()
    medicion_activada = False
    while True:
        key = stdscr.getch()
        if key == ord('a') and not medicion_activada:
            pwm1.ChangeDutyCycle(duty1 + incremento1)
            tiempo_inicio = time()
            medicion_activada = True
            stdscr.addstr(9, 0, "🟢 MOTOR 1 en movimiento... contando tiempo...")
        elif key == ord('z') and medicion_activada:
            pwm1.ChangeDutyCycle(0)
            t1 = time() - tiempo_inicio
            tiempos_m1.append(t1)
            stdscr.addstr(10, 0, f"⏱️  Tiempo MOTOR 1: {t1:.2f} segundos.")
            break
        sleep(0.05)

    stdscr.addstr(12, 0, "➡️  Posiciona MOTOR 2 con 'j'/'l'. ESPACIO cuando este listo.")
    stdscr.refresh()
    while True:
        key = stdscr.getch()
        if key == ord('j'):
            pwm2.ChangeDutyCycle(duty2 - 0.1)
        elif key == ord('l'):
            pwm2.ChangeDutyCycle(duty2 + 0.1)
        elif key == ord(' '):
            pwm2.ChangeDutyCycle(0)
            break
        sleep(0.05)

    # Medir Motor 2
    stdscr.addstr(14, 0, "Pulsa 'd' para INICIAR MOTOR 2, 'z' para PARAR.")
    stdscr.refresh()
    medicion_activada = False
    while True:
        key = stdscr.getch()
        if key == ord('d') and not medicion_activada:
            pwm2.ChangeDutyCycle(duty2 + incremento2)
            tiempo_inicio = time()
            medicion_activada = True
            stdscr.addstr(15, 0, "🟢 MOTOR 2 en movimiento... contando tiempo...")
        elif key == ord('z') and medicion_activada:
            pwm2.ChangeDutyCycle(0)
            t2 = time() - tiempo_inicio
            tiempos_m2.append(t2)
            stdscr.addstr(16, 0, f"⏱️  Tiempo MOTOR 2: {t2:.2f} segundos.")
            break
        sleep(0.05)

    diferencia = abs(t1 - t2) / t1 * 100
    diferencias.append(diferencia)
    stdscr.addstr(18, 0, f"📊 Diferencia: {diferencia:.2f}%")
    if diferencia <= 10:
        stdscr.addstr(19, 0, "✅ Diferencia aceptable.")
    else:
        stdscr.addstr(19, 0, "⛔ Diferencia fuera de rango (>7%)")
    stdscr.addstr(21, 0, "Pulsa cualquier tecla para continuar...")
    stdscr.refresh()
    stdscr.getch()
    return diferencia <= 10

def ciclo_fase(stdscr, incrementos_base, ajuste_incremento2, tiempos_m1, tiempos_m2, diferencias, duty1, duty2, modo):
    partes_validas = 0
    for parte in range(3):
        valido = medir_parte(stdscr, parte, incrementos_base[parte], ajuste_incremento2, tiempos_m1, tiempos_m2, diferencias, duty1, duty2, modo)
        if valido:
            partes_validas += 1
    return partes_validas

def main(stdscr):
    global duty1, duty2, fase, ajuste_incremento2_pos, ajuste_incremento2_neg

    # FASE 1: CALIBRACION PARADA
    while fase == 1:
        stdscr.clear()
        stdscr.addstr(0, 0, "="*52)
        stdscr.addstr(1, 0, "=          🛑 CALIBRACION DE PARADA MANUAL           =")
        stdscr.addstr(2, 0, "="*52)
        stdscr.addstr(4, 0, f"🔧 Duty Motor 1: {duty1:.3f} | Duty Motor 2: {duty2:.3f}")
        stdscr.addstr(6, 0, "➡️  'a'/'d' Motor 1 bajar/subir | 'j'/'l' Motor 2 bajar/subir")
        stdscr.addstr(7, 0, "✅ ENTER para probar parada | ❌ 'q' salir")
        stdscr.refresh()

        key = stdscr.getch()
        if key == ord('a'):
            duty1 -= 0.01
        elif key == ord('d'):
            duty1 += 0.01
        elif key == ord('j'):
            duty2 -= 0.01
        elif key == ord('l'):
            duty2 += 0.01
        elif key == ord('\n'):
            stdscr.addstr(9, 0, "⏳ Probando parada...")
            set_duty(pwm1, duty1, 2)
            set_duty(pwm2, duty2, 2)
            stdscr.addstr(10, 0, "❓ Confirmar parada? 'y' si, 'n' no")
            stdscr.refresh()
            while True:
                confirm_key = stdscr.getch()
                if confirm_key == ord('y'):
                    fase = 2
                    break
                elif confirm_key == ord('n'):
                    break
        elif key == ord('q'):
            return

    # FASE 2: POSITIVO
    incrementos_base_pos = [0.10, 0.15, 0.20]
    while True:
        tiempos_motor1_pos.clear()
        tiempos_motor2_pos.clear()
        diferencias_pos.clear()
        partes_validas = ciclo_fase(stdscr, incrementos_base_pos, ajuste_incremento2_pos, tiempos_motor1_pos, tiempos_motor2_pos, diferencias_pos, duty1, duty2, "POSITIVO")
        if partes_validas >= 2:
            break
        else:
            ajustes = sum(1 if t2 > t1 else -1 for t1, t2 in zip(tiempos_motor1_pos, tiempos_motor2_pos))
            ajuste_incremento2_pos += 0.01 * ajustes
            sleep(2)

    # FASE 3: NEGATIVO
    incrementos_base_neg = [-0.10, -0.15, -0.20]
    while True:
        tiempos_motor1_neg.clear()
        tiempos_motor2_neg.clear()
        diferencias_neg.clear()
        partes_validas = ciclo_fase(stdscr, incrementos_base_neg, ajuste_incremento2_neg, tiempos_motor1_neg, tiempos_motor2_neg, diferencias_neg, duty1, duty2, "NEGATIVO")
        if partes_validas >= 2:
            break
        else:
            ajustes = sum(1 if t2 > t1 else -1 for t1, t2 in zip(tiempos_motor1_neg, tiempos_motor2_neg))
            ajuste_incremento2_neg += 0.01 * ajustes
            sleep(2)

try:
    curses.wrapper(main)
except KeyboardInterrupt:
    print("Interrumpido por el usuario")
finally:
    pwm1.stop()
    pwm2.stop()
    GPIO.cleanup()

    print("\n========== RESULTADOS FINALES ==========")
    print("\nMOTOR 1:")
    print(f"  parada: {duty1:.3f}")
    for i, t in enumerate(tiempos_motor1_pos + tiempos_motor1_neg):
        print(f"  parte {i+1}: {t:.2f} seg")

    print("\nMOTOR 2:")
    print(f"  parada: {duty2:.3f}")
    for i, t in enumerate(tiempos_motor2_pos + tiempos_motor2_neg):
        print(f"  parte {i+1}: {t:.2f} seg")

    print(f"\nIncrementos Motor 2 ajustado POS: {ajuste_incremento2_pos:.3f}")
    print(f"Incrementos Motor 2 ajustado NEG: {ajuste_incremento2_neg:.3f}")
    print("\n✅ Calibracion completa")
    print("\nGPIO limpio, saliendo.")
