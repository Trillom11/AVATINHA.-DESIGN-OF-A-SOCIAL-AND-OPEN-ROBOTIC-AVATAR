import sys
import time
import pigpio

# Pines de los servos
MG996R_PIN = 18  # Eje X
FS5103R_PIN = 12  # Eje Y

# Pulso inicial en microsegundos
pulso_x = 1514
pulso_y = 1488

# Incremento de calibracion en microsegundos
PASO = 1

# Inicia pigpio
pi = pigpio.pi()
if not pi.connected:
    print("ERROR: pigpiod no esta corriendo. Ejecuta 'sudo pigpiod' y vuelve a intentarlo.")
    sys.exit(1)

pi.set_mode(MG996R_PIN, pigpio.OUTPUT)
pi.set_mode(FS5103R_PIN, pigpio.OUTPUT)
pi.set_PWM_frequency(MG996R_PIN, 50)
pi.set_PWM_frequency(FS5103R_PIN, 50)

try:
    print("CALIBRACION PULSO NEUTRO SERVOS CONTINUOS")
    print("Ajusta pulso en microsegundos. 'a' baja, 'd' sube, Enter confirma.")

    # Calibrar servo X
    while True:
        pi.set_servo_pulsewidth(MG996R_PIN, pulso_x)
        print(f"Servo X (GPIO{MG996R_PIN}) -> Pulso: {pulso_x} us")
        key = input("X >> ")
        if key == "a":
            pulso_x -= PASO
        elif key == "d":
            pulso_x += PASO
        elif key == "":
            break

    print("\nServo X calibrado en", pulso_x, "us\n")

    print("Ahora calibra servo Y. 'j' baja, 'l' sube, Enter confirma.")
    # Calibrar servo Y
    while True:
        pi.set_servo_pulsewidth(FS5103R_PIN, pulso_y)
        print(f"Servo Y (GPIO{FS5103R_PIN}) -> Pulso: {pulso_y} us")
        key = input("Y >> ")
        if key == "j":
            pulso_y -= PASO
        elif key == "l":
            pulso_y += PASO
        elif key == "":
            break

    print("\nServo Y calibrado en", pulso_y, "us")

    print(f"\nRESULTADO NEUTRO FINAL:\n  Servo X: {pulso_x} us\n  Servo Y: {pulso_y} us")

finally:
    # Desactiva servos
    pi.set_servo_pulsewidth(MG996R_PIN, 0)
    pi.set_servo_pulsewidth(FS5103R_PIN, 0)
    pi.stop()
    print("\nCalibracion completada. GPIO limpio, saliendo.")
