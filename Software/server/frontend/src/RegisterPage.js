import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Importa axios para realizar peticiones HTTP al backend

// Importa la imagen del logo directamente
// Asegúrate de que 'logo_cesga.png' esté en el mismo directorio que este archivo.
import cesgaLogo from './logo_cesga.png'; 

// --- Componente de icono: Usuario ---
const UserIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

// --- Componente de icono: Correo ---
const MailIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2" ry="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
);

// --- Componente de icono: Candado ---
const LockIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

// --- Componente de icono: Añadir Usuario ---
const UserPlusIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" x2="19" y1="8" y2="14"></line>
        <line x1="22" x2="16" y1="11" y2="11"></line>
    </svg>
);

// --- Componente de icono: Tick de Verificación ---
const CheckCircleIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

// --- Componente de icono: Cruz de Error ---
const XCircleIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

// --- Componente de icono: Flecha de Atrás ---
const BackIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

// --- Componente Botón de Atrás ---
const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="back-button">
        <BackIcon size={20} color="var(--color-text-dark-gray)" />
        Atrás
    </button>
);


// --- Componente principal de la aplicación ---
function App() {
    let navigate = useNavigate();

    const [email, setEmail] = useState(""); // Este estado ahora puede contener un nombre de usuario o un email
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false); // Controla si el nombre de usuario/email ya fue verificado
    const [shouldShowPasswordField, setShouldShowPasswordField] = useState(false); // Controla si se muestra el campo de contraseña

    // URL de tu servidor backend. ¡IMPORTANTE: Cambia esto a la URL real de tu backend!
    // Por ejemplo: 'https://tu-dominio.com/api' o 'http://localhost:3001' si lo ejecutas localmente
    const apiUrl = process.env.REACT_APP_API_URL;

    // Función para verificar el usuario/email en el backend (que se conectará a MySQL)
    const checkEmailOnBackend = async (identifierToCheck) => {
        try {
            // Se envía el identificador (que puede ser email o nombre de usuario) al backend
            const res = await axios.post(`${apiUrl}/api/check-user`, { identifier: identifierToCheck });
            // El backend debería devolver: { exists: boolean, hasPassword: boolean, userNivel: number }
            return res.data;
        } catch (error) {
            console.error("Error al verificar usuario en el backend:", error);
            if (error.response) {
                return { error: error.response.data.message || "Error al verificar el usuario." };
            }
            return { error: "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo." };
        }
    };

    // Función para registrar/actualizar usuario en el backend (que se conectará a MySQL)
    const registerUserOnBackend = async (identifierToRegister, passwordToSet) => {
        try {
            // Se envía el identificador y la contraseña al backend
            const res = await axios.post(`${apiUrl}/api/register-update-password`, { identifier: identifierToRegister, password: passwordToSet });
            // El backend debería devolver: { success: boolean, message: string, nivel: number, token: string }
            return res.data;
        } catch (error) {
            console.error("Error al registrar/actualizar usuario en el backend:", error);
            if (error.response) {
                return { success: false, message: error.response.data.message || "Error al registrar/actualizar la cuenta." };
            }
            return { success: false, message: "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo." };
        }
    };

    // Maneja la verificación del usuario/email
    const handleIdentifierCheck = async (e) => { // Renombrado de handleEmailCheck
        e.preventDefault(); 
        if (!email) { // 'email' ahora se usa para el nombre de usuario/identificador
            setMessage("Por favor, introduce tu nombre de usuario o correo electrónico.");
            return;
        }

        setIsLoading(true);
        setMessage("");
        setEmailChecked(false); 
        setShouldShowPasswordField(false); 
        setPassword(""); // Limpiar la contraseña al verificar un nuevo identificador

        try {
            const { exists, hasPassword, error } = await checkEmailOnBackend(email); // Se sigue usando 'email' como el valor del input

            if (error) {
                setMessage(`❌ ${error}`);
            } else if (exists) {
                if (hasPassword) {
                    setMessage("❌ Ya existe una contraseña para este usuario. Por favor, inicia sesión.");
                    // No se muestra el campo de contraseña
                } else {
                    setEmailChecked(true); 
                    setShouldShowPasswordField(true); 
                    setMessage("✅ ¡Bienvenido de nuevo! Por favor, establece tu contraseña.");
                }
            } else {
                setMessage("❌ El usuario no se encuentra en nuestra base de datos. Por favor, verifica el nombre.");
                // No se muestra el campo de contraseña
            }
        } catch (err) {
            setMessage("Hubo un problema al verificar el usuario. Inténtalo de nuevo.");
            console.error("Error checking user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Maneja el registro final o la actualización de contraseña
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage("Por favor, completa la contraseña.");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const res = await registerUserOnBackend(email, password); // Se sigue usando 'email' como el valor del input

            if (res.success) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("nivel", res.nivel);
                setMessage(`✅ ${res.message}`);
                setTimeout(() => {
                    // Redirige al usuario después de un registro/actualización exitoso
                    if (res.nivel === 1) {
                        navigate("/admin");
                    } else if (res.nivel === 2) {
                        navigate("/dashboard");
                    } else {
                        navigate("/stream/:id");
                    }
                }, 1000);
            } else {
                setMessage(`❌ ${res.message || "Error al registrar/actualizar la cuenta."}`);
            }
        } catch (err) {
            setMessage("❌ Hubo un error inesperado. Inténtalo de nuevo.");
            console.error("Error registering user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                /* Variables de color */
                :root {
                    --color-bg-light-blue: #E0F7FA; /* Cielo despejado */
                    --color-bg-mint-green: #E8F5E9; /* Hoja tierna */
                    --color-interactive-yellow: #FFECB3; /* Amarillo suave para resaltados */
                    --color-interactive-orange: #FFAB91; /* Naranja coral para botones */
                    --color-text-dark-gray: #424242; /* Gris oscuro suave */
                    --color-success-green: #A5D6A7; /* Verde suave éxito */
                    --color-error-red: #EF9A9A; /* Rojo pálido error */
                    --color-border-inactive: #BDBDBD; /* Gris claro para bordes inactivos */
                    --color-form-bg-opacity: rgba(255, 255, 255, 0.9); /* Blanco ligeramente opaco */
                }

                /* Importa las fuentes */
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');

                body {
                    margin: 0;
                    font-family: 'Open Sans', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    overflow: hidden;
                }

                .register-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, var(--color-bg-light-blue) 0%, var(--color-bg-mint-green) 100%);
                    position: relative;
                    overflow: hidden;
                }

                /* Botón de Atrás */
                .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background-color: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(150, 150, 150, 0.3);
                    border-radius: 12px;
                    padding: 8px 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 0.9rem;
                    color: var(--color-text-dark-gray);
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s ease;
                    z-index: 20; /* Asegura que esté encima de todo */
                }
                .back-button:hover {
                    background-color: rgba(255, 255, 255, 0.9);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                .back-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                /* Título de la aplicación */
                .app-title {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 3rem; /* Ajustado para registro */
                    font-weight: 700;
                    color: var(--color-text-dark-gray);
                    margin-bottom: 30px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .app-title {
                        font-size: 2rem;
                    }
                }

                /* Caja de contenido central */
                .content-box {
                    background: var(--color-form-bg-opacity);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    z-index: 10;
                }

                .content-box:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }

                .welcome-text {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--color-text-dark-gray);
                    margin-bottom: 25px;
                    text-align: center;
                }

                .form-group {
                    position: relative;
                    margin-bottom: 20px;
                }

                .form-icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-dark-gray);
                    opacity: 0.7;
                }

                .form-input {
                    width: calc(100% - 30px);
                    padding: 14px 15px 14px 50px;
                    border-radius: 12px;
                    border: 2px solid var(--color-border-inactive);
                    font-size: 1rem;
                    color: var(--color-text-dark-gray);
                    outline: none;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .form-input::placeholder {
                    color: var(--color-text-dark-gray);
                    opacity: 0.6;
                }

                .form-input:focus {
                    border-color: var(--color-interactive-yellow);
                    box-shadow: 0 0 0 3px rgba(255, 236, 179, 0.5); /* Sombra de enfoque suave */
                }

                .main-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px 20px;
                    background-color: var(--color-interactive-orange);
                    color: white;
                    font-family: 'Quicksand', sans-serif;
                    font-weight: 700;
                    font-size: 1.2rem;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }

                .main-button:hover:not(:disabled) {
                    background-color: #FF8A65; /* Tono más oscuro de naranja coral */
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                }

                .main-button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .main-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background-color: #ccc; /* Color gris para deshabilitado */
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .message {
                    margin-top: 20px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.95rem;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: rgba(255, 255, 255, 0.8);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .message.success {
                    color: var(--color-success-green);
                    border: 1px solid var(--color-success-green);
                }

                .message.error {
                    color: var(--color-error-red);
                    border: 1px solid var(--color-error-red);
                }

                .login-link {
                    margin-top: 25px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--color-text-dark-gray);
                }

                .login-link a {
                    color: var(--color-interactive-orange);
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .login-link a:hover {
                    color: #FF8A65;
                    text-decoration: underline;
                }

                /* Animación para la aparición de campos */
                .fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Powered By Placeholder */
                .powered-by-placeholder {
                    margin-top: 30px;
                    color: var(--color-text-dark-gray); /* Cambiado a gris oscuro para mejor contraste con fondo claro */
                    font-family: 'Open Sans', sans-serif; /* Usando Open Sans para coherencia */
                    font-size: 0.9rem;
                    opacity: 0.8;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.05); /* Sombra más sutil */
                    text-align: center;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .powered-by-logo {
                    height: 24px; /* Ajusta la altura según sea necesario para el logo */
                    vertical-align: middle; /* Alinea con el texto */
                }
                `}
            </style>

            <div className="register-container">
                {/* Botón de Atrás */}
                {/* El botón de atrás solo se muestra si no estás en la página de inicio (ruta "/") */}
                {window.location.pathname !== '/' && <BackButton onClick={() => navigate(-1)} />}

                <h1 className="app-title">✨ ¡Únete a la Academia! ✨</h1>

                <div className="content-box">
                    <h2 className="welcome-text">
                        {emailChecked && shouldShowPasswordField ? "¡Bienvenido de nuevo!" : ""}
                        {emailChecked && !shouldShowPasswordField && message.includes("Ya existe una contraseña") ? "¡Ya tienes contraseña!" : ""}
                        {!emailChecked && "Verifica tu cuenta"}
                    </h2>

                    <form onSubmit={shouldShowPasswordField ? handleRegisterSubmit : handleIdentifierCheck}> {/* CAMBIO: onSubmit ahora llama a handleIdentifierCheck */}
                        {/* Campo de Nombre de Usuario / Email */}
                        <div className="form-group">
                            <MailIcon className="form-icon" size={20} />
                            <input 
                                type="text" // CAMBIO: Cambiado de 'email' a 'text' para permitir nombres de usuario sin @
                                placeholder="Tu nombre de usuario o correo" // CAMBIO: Placeholder actualizado
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className="form-input"
                                disabled={isLoading || (emailChecked && !shouldShowPasswordField)} 
                                onBlur={!emailChecked ? handleIdentifierCheck : undefined} // CAMBIO: onBlur ahora llama a handleIdentifierCheck
                            />
                        </div>

                        {/* Campo de Contraseña (aparece condicionalmente) */}
                        {shouldShowPasswordField && (
                            <div className="form-group fade-in">
                                <LockIcon className="form-icon" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="Crea tu contraseña secreta" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="form-input"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Main button */}
                        <button 
                            type="submit" 
                            disabled={isLoading || (shouldShowPasswordField && !password)} 
                            className="main-button"
                        >
                            {isLoading ? (
                                <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"></circle>
                                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="white" className="opacity-75"></path>
                                </svg>
                            ) : (
                                <>
                                    {shouldShowPasswordField ? (
                                        <>
                                            <UserPlusIcon size={24} color="white" /> Establecer Contraseña
                                        </>
                                    ) : (
                                        <>
                                            <UserIcon size={24} color="white" /> Verificar Usuario
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mensajes de estado (éxito/error) */}
                    {message && (
                        <p className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                            {message.startsWith('✅') ? <CheckCircleIcon size={18} color="var(--color-success-green)" /> : <XCircleIcon size={18} color="var(--color-error-red)" />}
                            {message}
                        </p>
                    )}

                    {/* Link to login if already has an account */}
                    <p className="login-link">
                        ¿Ya tienes una cuenta? <a href="/">¡Inicia Sesión aquí!</a>
                    </p>
                </div>

                {/* Desarrollado por CESGA */}
                <div className="powered-by-placeholder">
                    Desarrollado por 
                    <img 
                        src={cesgaLogo} 
                        alt="Logo de CESGA" 
                        className="powered-by-logo"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x24/CCCCCC/333333?text=Error+Logo'; }} // Fallback for image loading errors
                    />
                </div>
            </div>
        </>
    );
}

export default App;
