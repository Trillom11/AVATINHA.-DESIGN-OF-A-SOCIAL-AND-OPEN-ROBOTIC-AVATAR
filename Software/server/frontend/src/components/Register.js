import { useState } from "react";
import axios from "axios";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/register", { email, password });
            setMessage("Usuario registrado correctamente");
        } catch (err) {
            setMessage("Error al registrar usuario");
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleRegister}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Registrarse</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Register;

