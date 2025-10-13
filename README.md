# 🤖 Avatiñ@: Avatar Robótico Social y Abierto



**Avatiñ@ is a social telepresence robot, open-source and low-cost, designed to keep students who are hospitalized or absent for long periods connected with their classroom and peers.**

This project was born as an affordable (estimated cost of €100-€200) and customizable alternative to existing commercial solutions, allowing any school or family to build and adapt their own robotic avatar.

---

### ✨ Key Features

* **Full Telepresence:** Real-time, two-way video and audio streaming with low latency (100-200 ms) thanks to WebRTC.
* **100% Open-Source Design:** All design plans (FreeCAD), 3D printing files (STL), and software are completely open.
* **Screwless Assembly:** An innovative, modular puzzle-like chassis that assembles in under 30 minutes without a single screw.
* **Emotional Expression:** Animated "eyes" using LED matrices allow the robot to display emotions for a richer, more natural interaction.
* **Intuitive Web Control:** A modern web interface (React) allows students to easily control the robot from a computer or tablet.
* **Low Cost:** Built with accessible components like a Raspberry Pi 4 and 3D-printed parts, democratizing access to this technology.

---

### 📂 Repository Structure

To facilitate navigation, the project is organized into three main folders: `hardware`, `software`, and `docs`.

* **`/docs`**: Contains the project documentation, including the **complete PDF report** and other relevant guides.
* **`/hardware`**: Here you will find everything needed to build the physical part of the robot.
    * `/stl`: `.stl` files ready to be sliced and 3D printed.
    * `/freecad`: FreeCAD (`.FCStd`) source files if you want to modify the chassis design.
* **`/software`**: Contains all the code necessary for Avatiñ@ to function. It is divided into two main parts:
    * **`/raspberry`**: Python scripts that run on the Raspberry Pi. They are the "brain" of the robot, responsible for controlling the motors, LEDs, camera, and communication with the server.
    * **`/server`**: The complete web application, which is in turn divided into:
        * `/backend`: The central server (Node.js) that acts as a bridge between the robot and the user. It manages the database, connections, and business logic.
        * `/frontend`: The user interface (React) with which administrators, teachers, and students interact to control the robot and manage the system.

---

### 🚀 Quick Start Guide

To build your own Avatiñ@, follow these steps:

#### 1. Hardware

The robot's structure is designed to be manufactured with any standard 3D printer.

* **3D Printing Files:** Find all the ready-to-print `.stl` files in the [`/hardware/stl`](/hardware/stl) folder.
* **Design Files:** If you wish to modify the chassis, the original FreeCAD files are in the [`/hardware/freecad`](/hardware/freecad) folder.
* **Component List:**
    * Raspberry Pi 4 Model B (8GB)
    * Raspberry Pi Camera Module
    * I2S INMP441 Microphone and USB Speakers
    * 2x 8x8 LED Matrices with MAX7219 controller
    * 2x FS5103R continuous rotation servomotors
    * 21700-type Li-Ion batteries and charging module
    * Cables, breadboard, and USB-C connector

#### 2. Software (End User)

* **Robot (Raspberry Pi):**
    1.  Clone this repository onto your Raspberry Pi.
    2.  Navigate to the `/software/raspberry` folder.
    3.  Run the startup script: `bash iniciador.sh`.
    4.  The robot will generate a 6-digit code to link it to the web platform.

* **Server:**
    1.  Deploy the complete web application (`/software/server`) on a hosting service compatible with Node.js and MariaDB.
    2.  Access the web interface to register, link the robot, and assign it to a student.

---

### 🛠️ Developer's Guide

Want to modify the code or contribute to the project? Great! Here’s how to set up a local development environment.

#### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.x or higher)
* A local instance of [MariaDB](https://mariadb.org/)
* [Git](https://git-scm.com/)

#### Setup Steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/Avatinha-Robot.git](https://github.com/your-username/Avatinha-Robot.git)
    cd Avatinha-Robot
    ```

2.  **Configure the Backend:**
    * Navigate to the backend folder: `cd software/server/backend`
    * Install dependencies: `npm install`
    * Configure your environment variables (create a `.env` file) for your MariaDB database connection.
    * Start the development server: `npm start`
    * The backend will be listening on the port you have configured (e.g., `http://localhost:8888`).

3.  **Configure the Frontend:**
    * Open a new terminal and navigate to the frontend folder: `cd software/server/frontend`
    * Install dependencies: `npm install`
    * Ensure the backend server URL is correctly configured in the React files (usually in an Axios configuration file or similar).
    * Start the React application: `npm start`
    * The web interface will open in your browser (e.g., `http://localhost:3000`).

Now you can modify the server or interface code and see the changes reflected in real-time.

---

### Acknowledgments

This project was developed by Raúl Trillo as his Final Degree Project in Robotics at the [University of Santiago de Compostela](https://www.usc.gal/), in collaboration with the [CESGA (Galicia Supercomputing Center)](https://www.cesga.es/).
