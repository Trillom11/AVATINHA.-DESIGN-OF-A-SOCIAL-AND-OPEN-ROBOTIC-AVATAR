# Software del Robot Avatiñ@ 🤖

Este directorio contiene todo el código fuente necesario para el funcionamiento del robot Avatiñ@ y su plataforma de control. El proyecto es de código abierto, con la intención de que pueda ser estudiado, replicado y mejorado por la comunidad.

## Descripción del Proyecto

Avatiñ@ es un robot de telepresencia desarrollado como Trabajo de Fin de Grado. Su objetivo principal es combatir el aislamiento social y educativo que sufre el alumnado con ausencias prolongadas, permitiéndole asistir y participar en las clases de forma remota a través de un avatar robótico físico.

Para más información sobre el hardware y el montaje, consulta la documentación principal del proyecto.

---

## Arquitectura del Software

El software se divide en dos componentes principales que trabajan en conjunto: el **servidor** (el centro de control) y el software de la **raspberry** (el cerebro del robot).

### `server/` - El Centro de Control

Esta carpeta contiene la aplicación web completa que sirve como interfaz de control y como intermediario entre el usuario y el robot. Está construida sobre una arquitectura moderna *full-stack*.

-   **Frontend (React):** Es la interfaz de usuario con la que interactúan los diferentes perfiles (alumno, profesor, administrador). Desde aquí se envían los comandos de movimiento, se visualiza el streaming de vídeo/audio y se gestiona el robot.

-   **Backend (Node.js):** Es el cerebro del servidor. Se encarga de:
    -   Gestionar las sesiones de los usuarios y sus permisos.
    -   Actuar como servidor de señalización para establecer la conexión **WebRTC** entre el navegador del usuario y la Raspberry Pi.
    -   Reenviar los comandos de control (movimiento, animaciones, etc.) desde el usuario hasta el robot a través de **WebSockets**.

-   **Base de Datos (MariaDB):** Almacena la información persistente, como los perfiles de usuario, los roles y los robots vinculados.

### `raspberry/` - El Cerebro del Robot

Esta carpeta contiene todo el código que se ejecuta directamente en la **Raspberry Pi 4** del robot. Es el controlador principal que dota al robot de sus capacidades físicas.

-   **Controlador (Python):** Este script es el responsable de interactuar directamente con el hardware del robot. Sus principales funciones son:
    -   Recibir los comandos enviados desde el `server` a través de WebSockets.
    -   Controlar los servomotores para los movimientos de giro (*pan*) e inclinación (*tilt*).
    -   Gestionar las matrices LED para mostrar animaciones en los "ojos".
    -   Capturar el vídeo desde la cámara y el audio desde el micrófono.
    -   Establecer la conexión WebRTC para enviar el stream de audio y vídeo en tiempo real hacia el usuario.

---

## Flujo de Comunicación

1.  El usuario inicia sesión en la interfaz web (**Frontend React**).
2.  La interfaz establece una conexión **WebSocket** con el servidor **Backend (Node.js)**.
3.  A su vez, el servidor mantiene una conexión WebSocket con el controlador **Python** en la Raspberry Pi.
4.  Cuando el usuario realiza una acción (ej. mover a la izquierda), el comando viaja instantáneamente: `React -> Node.js -> Python`.
5.  El script de Python recibe el comando y mueve el servomotor correspondiente.
6.  Simultáneamente, la Raspberry Pi envía su stream de vídeo y audio al usuario a través de una conexión **WebRTC** directa, que fue negociada previamente por el servidor Node.js.

---

## Puesta en Marcha

Para poner en funcionamiento el proyecto, se deben configurar y ejecutar ambos componentes por separado. Consulta la guía para desarrolladores en el `README` principal del repositorio para obtener instrucciones detalladas.
