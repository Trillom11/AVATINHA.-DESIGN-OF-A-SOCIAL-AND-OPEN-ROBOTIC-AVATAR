import React from "react";

function ControlMotor() {
    const raspberryPiUrl = "http://10.212.5.49:5000"; // Flask en la Raspberry

    const mover = (direccion) => {
        fetch(`${raspberryPiUrl}/start?direccion=${direccion}`)
            .then((res) => res.text())
            .then((data) => console.log(data))
            .catch((err) => console.error("Error:", err));
    };

    const parar = () => {
        fetch(`${raspberryPiUrl}/stop`)
            .then((res) => res.text())
            .then((data) => console.log(data))
            .catch((err) => console.error("Error:", err));
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Control de Motor</h1>
            <button
                onMouseDown={() => mover("izquierda")}
                onMouseUp={parar}
                style={{ fontSize: "24px", margin: "20px", padding: "10px 20px" }}
            >
                ⬅️ Izquierda
            </button>
            <button
                onMouseDown={() => mover("derecha")}
                onMouseUp={parar}
                style={{ fontSize: "24px", margin: "20px", padding: "10px 20px" }}
            >
                ➡️ Derecha
            </button>
        </div>
    );
}

export default ControlMotor;
