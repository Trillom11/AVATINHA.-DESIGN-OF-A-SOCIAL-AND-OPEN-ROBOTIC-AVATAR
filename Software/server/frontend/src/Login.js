import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Importamos axios para realizar peticiones HTTP al backend

// Importa la imagen del logo directamente
import cesgaLogo from './logo_cesga.png'; // Asegúrate de que esta ruta sea correcta
import avatinhaLogo from './avatinha_logo.png'; // <-- Esto es clave

// Inline SVG icons for a self-contained solution without external icon libraries
// New UserIcon for the username field
const UserIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LockIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const LogInIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" x2="3" y1="12" y2="12"></line>
    </svg>
);

const UserPlusIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" x2="19" y1="8" y2="14"></line>
        <line x1="22" x2="16" y1="11" y2="11"></line>
    </svg>
);


function App() {
    let navigate = useNavigate();

    // Changed 'email' state to 'username'
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Activate loading indicator
        setMessage(""); // Clear previous messages
        try {
            // Define the URL for your backend API.
            // This URL is where your server (which connects to the database) is listening.
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'; 
            
            // Make a POST request to the backend with username and password.
            // The backend will be responsible for verifying this data against the database.
            // Changed 'email' to 'username' in the payload
            const res = await axios.post(`${apiUrl}/api/login`, { email, password }); 
            
            // If authentication is successful, the backend returns a token, user level, and potentially robotId.
            // These are saved in the browser's local storage.
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("nivel", res.data.nivel);
            // CAMBIO: Almacenar el robotId si viene del backend
            if (res.data.robotId) {
                localStorage.setItem("robotId", res.data.robotId);
            } else {
                localStorage.removeItem("robotId"); // Limpiar si no hay robotId
            }
            setMessage("✅ ¡Inicio de sesión exitoso!");
            
            // Redirect the user according to their level after a short delay.
            setTimeout(() => {
              if (res.data.nivel === 1) {
                navigate("/admin");
            } 
            else if (res.data.nivel === 2) {
                navigate("/dashboard");           
            }else if (res.data.nivel === 3) { // Lógica para alumnos (nivel 3)
                if (res.data.robotId) {
                    navigate(`/stream/${res.data.robotId}`); // Redirige al stream con el ID del robot
                } else {
                    navigate("/no-robot-assigned"); // Redirige a la página de "no robot asignado"
                }
            } else {
                // Fallback para otros niveles no definidos explícitamente
                navigate("/"); 
            }
            }, 500);
        } catch (err) {
            // If there's an error (e.g., incorrect credentials), an error message is displayed.
            // The error comes from the backend if database verification fails.
            const errorMessage = err.response?.data?.error || "¡Ups! Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.";
            setMessage(`❌ ${errorMessage}`); 
            console.error("Error de inicio de sesión:", err); // For debugging
        } finally {
            setIsLoading(false); // Deactivate loading indicator
        }
    };

    // Function for the register button (assumes there's a '/register' route in your Router)
    const handleRegister = () => {
        console.log("Navegando a la página de registro...");
        navigate("/register");
    };

    return (
        <>
            <style>
                {`
                /* Color Variables */
                :root {
                    --color-primary-light: #A7D9FF; /* Soft sky blue */
                    --color-primary-medium: #7FC0F0; /* More vibrant blue */
                    --color-secondary-light: #FFD9A7; /* Soft peach orange */
                    --color-secondary-medium: #FFB070; /* More vibrant orange */
                    --color-accent-green: #90EE90; /* Mint green */
                    --color-accent-purple: #DDA0DD; /* Soft lilac */
                    --color-text-dark: #4A4A6A; /* Soft dark blue */
                    --color-text-light: #FFFFFF;
                    --color-form-bg: rgba(255, 255, 255, 0.9); /* Translucent white */
                    --color-border: rgba(150, 150, 150, 0.3); /* Soft border */
                    --color-success: #4CAF50; /* Success green */
                    --color-error: #F44336; /* Error red */
                }

                /* Import Inter font */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                /* Import Comfortaa font for friendly titles */
                @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');


                body {
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    overflow: hidden; /* Prevents scroll if content is smaller */
                }

                .app-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-purple) 50%, var(--color-secondary-light) 100%);
                    animation: backgroundShift 15s ease infinite alternate; /* Background animation */
                    position: relative;
                    overflow: hidden;
                }

                /* Subtle background animation */
                @keyframes backgroundShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Decorative background elements (bubbles, clouds) */
                .bubble {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    animation: floatUp 15s ease-in-out infinite;
                }
                .bubble:nth-child(1) { width: 60px; height: 60px; left: 10%; top: 20%; animation-delay: 0s; }
                .bubble:nth-child(2) { width: 40px; height: 40px; left: 80%; top: 50%; animation-delay: 3s; }
                .bubble:nth-child(3) { width: 80px; height: 80px; left: 30%; top: 70%; animation-delay: 6s; }
                .bubble:nth-child(4) { width: 50px; height: 50px; left: 50%; top: 10%; animation-delay: 9s; }
                .bubble:nth-child(5) { width: 70px; height: 70px; left: 5%; top: 90%; animation-delay: 12s; }

                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 0.5; }
                    50% { transform: translateY(-20px) scale(1.1); opacity: 0.7; }
                    100% { transform: translateY(0) scale(1); opacity: 0.5; }
                }

                /* Logo Placeholder */
                .logo-placeholder {
                    width: 220px; /* Adjust size as needed */
                    height: 100px; /* Adjust size as needed */
                    background-color: rgba(255, 255, 255, 0.7); /* Placeholder background */
                    border-radius: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-dark);
                    font-family: 'Comfortaa', cursive;
                    font-size: 1.2rem;
                    font-weight: 700;
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    text-align: center;
                    flex-shrink: 0; /* Prevent shrinking on smaller screens */
                }

                .app-title {
                    font-family: 'Comfortaa', cursive;
                    font-size: 3.5rem; /* 56px */
                    font-weight: 700;
                    color: var(--color-text-light);
                    margin-bottom: 40px;
                    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
                    animation: fadeInDown 1s ease-out forwards;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .app-title {
                        font-size: 2.5rem; /* 40px */
                    }
                }

                .login-box {
                    background: var(--color-form-bg);
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    width: 100%;
                    max-width: 450px;
                    transform: translateY(0);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    z-index: 10; /* Ensures it's above the bubbles */
                }

                .login-box:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .welcome-text {
                    font-family: 'Comfortaa', cursive;
                    font-size: 2.2rem; /* 35.2px */
                    font-weight: 700;
                    color: var(--color-text-dark);
                    margin-bottom: 30px;
                    text-align: center;
                }

                .form-group {
                    position: relative;
                    margin-bottom: 25px;
                }

                .form-icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-dark);
                    opacity: 0.6;
                }

                .form-input {
                    width: calc(100% - 30px); /* Adjustment for padding */
                    padding: 15px 15px 15px 50px; /* Space for icon */
                    border-radius: 15px;
                    border: 2px solid var(--color-border);
                    font-size: 1.1rem; /* 17.6px */
                    color: var(--color-text-dark);
                    outline: none;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .form-input::placeholder {
                    color: var(--color-text-dark);
                    opacity: 0.5;
                }

                .form-input:focus {
                    border-color: var(--color-primary-medium);
                    box-shadow: 0 0 0 4px rgba(127, 192, 240, 0.3); /* Soft focus shadow */
                }

                .login-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 15px 20px;
                    background: linear-gradient(45deg, var(--color-accent-green) 0%, var(--color-primary-medium) 100%);
                    color: var(--color-text-light);
                    font-weight: 700;
                    font-size: 1.3rem; /* 20.8px */
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }

                .login-button:hover:not(:disabled) {
                    background: linear-gradient(45deg, var(--color-primary-medium) 0%, var(--color-accent-green) 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                }

                .login-button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }

                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .message {
                    margin-top: 25px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.1rem; /* 17.6px */
                    padding: 10px;
                    border-radius: 10px;
                    background-color: rgba(255, 255, 255, 0.7);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                .message.success {
                    color: var(--color-success);
                    border: 1px solid var(--color-success);
                }

                .message.error {
                    color: var(--color-error);
                    border: 1px solid var(--color-error);
                }

                .separator {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin: 30px 0;
                }

                .separator::before,
                .separator::after {
                    content: '';
                    flex-grow: 1;
                    height: 2px;
                    background-color: var(--color-border);
                    border-radius: 1px;
                }

                .separator-text {
                    flex-shrink: 0;
                    margin: 0 15px;
                    color: var(--color-text-dark);
                    font-weight: 500;
                    font-size: 1rem; /* 16px */
                    background-color: var(--color-form-bg);
                    padding: 0 10px;
                    border-radius: 5px;
                }

                .register-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 15px 20px;
                    background: linear-gradient(45deg, var(--color-accent-purple) 0%, var(--color-secondary-medium) 100%);
                    color: var(--color-text-light);
                    font-weight: 700;
                    font-size: 1.3rem; /* 20.8px */
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .register-button:hover {
                    background: linear-gradient(45deg, var(--color-secondary-medium) 0%, var(--color-accent-purple) 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                }

                .register-button:active {
                    transform: translateY(0);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }

                /* Powered By Placeholder */
                .powered-by-placeholder {
                    margin-top: 30px;
                    color: var(--color-text-light);
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    flex-shrink: 0; /* Prevent shrinking on smaller screens */
                    display: flex; /* Use flexbox to align text and image */
                    align-items: center; /* Vertically align items */
                    justify-content: center; /* Horizontally center items */
                    gap: 8px; /* Space between text and image */
                }

                .powered-by-logo {
                    height: 24px; /* Adjust height as needed for the logo */
                    vertical-align: middle; /* Align with text */
                }
                `}
            </style>
            {/* Main container with soft background and centering */}
            <div className="app-container">
                {/* Decorative background elements */}
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>

                <div className="logo-placeholder">
                    {/* You can place your logo image or SVG here */}
                    {/* For example: <img src="your-logo.png" alt="App Logo" style={{ width: '80px', height: '80px' }} /> */}
                    <img src={avatinhaLogo} alt="Avatiñ@ Logo" style={{ width: '200px', height: '80px' }} />
                    {/* Si quieres un texto alternativo visible cuando la imagen no carga, o como un extra: */}
                    {/* <p>LOGO</p> */}
                </div>

                {/* Application Title */}
                <h1 className="app-title">
                    Robot Avatiñ@
                </h1>

                {/* Login box with frosted glass effect */}
                <div className="login-box">
                    <h2 className="welcome-text">¡Bienvenid@ a avatinh@!</h2>
                    <form onSubmit={handleLogin}>
                        {/* Username Field - Changed from Email */}
                        <div className="form-group">
                            {/* Changed icon from MailIcon to UserIcon */}
                            <UserIcon className="form-icon" size={24} /> 
                            <input 
                                type="text" // Changed type from 'email' to 'text'
                                placeholder="Tu nombre de usuario" // Updated placeholder
                                onChange={(e) => setEmail(e.target.value)} // Updated state setter
                                required 
                                className="form-input"
                            />
                        </div>
                        {/* Password Field */}
                        <div className="form-group">
                            <LockIcon className="form-icon" size={24} />
                            <input 
                                type="password" 
                                placeholder="Tu clave secreta" 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="form-input"
                            />
                        </div>
                        {/* Login Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading} // Disable button while loading
                            className="login-button"
                        >
                            {isLoading ? (
                                <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"></circle>
                                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="white" className="opacity-75"></path>
                                </svg>
                            ) : (
                                <>
                                    <LogInIcon size={24} color="white" /> ¡Empieza la Experiencia!
                                </>
                            )}
                        </button>
                    </form>

                    {/* Status messages (success/error) */}
                    {message && (
                        <p className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                            {message}
                        </p>
                    )}

                    {/* Visual separator */}
                    <div className="separator">
                        <span className="separator-text">¿Nuevo por aquí?</span>
                    </div>

                    {/* Register Button */}
                    <button 
                        onClick={handleRegister} 
                        className="register-button"
                    >
                        <UserPlusIcon size={24} color="white" /> ¡Únete a avatinh@!
                    </button>
                </div>

                {/* Placeholder for "Powered By" */}
                <div className="powered-by-placeholder">
                    Desarrollado por 
                    <img 
                        src={cesgaLogo} // Now correctly imported
                        alt="Logo de la empresa" 
                        className="powered-by-logo"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x24/CCCCCC/333333?text=Error+Logo'; }} // Fallback for image loading errors
                    />
                </div>
            </div>
        </>
    );
}

export default App;