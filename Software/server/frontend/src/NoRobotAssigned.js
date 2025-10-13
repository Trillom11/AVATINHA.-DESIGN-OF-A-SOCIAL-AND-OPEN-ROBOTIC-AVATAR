import React from 'react';
import { useNavigate } from 'react-router-dom';
import cesgaLogo from './logo_cesga.png'; // Asegúrate de que esta ruta sea correcta

// Componente de icono para volver atrás
const BackIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const NoRobotAssigned = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Vuelve a la página anterior (login)
    };

    return (
        <>
            <style>
                {`
                /* Color Variables (consistent with Login/Register) */
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
                    --color-error: #F44336; /* Error red */
                }

                /* Import Inter and Comfortaa fonts */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');

                body {
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    overflow: hidden;
                }

                .no-robot-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-purple) 50%, var(--color-secondary-light) 100%);
                    animation: backgroundShift 15s ease infinite alternate;
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                }

                @keyframes backgroundShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .no-robot-card {
                    background: var(--color-form-bg);
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    width: 100%;
                    max-width: 500px;
                    transform: translateY(0);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    z-index: 10;
                }
                .no-robot-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .no-robot-title {
                    font-family: 'Comfortaa', cursive;
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--color-text-dark);
                    margin-bottom: 20px;
                }

                .no-robot-message {
                    font-size: 1.1rem;
                    color: var(--color-text-dark);
                    margin-bottom: 30px;
                    line-height: 1.6;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px 30px;
                    background: linear-gradient(45deg, var(--color-primary-medium) 0%, var(--color-accent-green) 100%);
                    color: var(--color-text-light);
                    font-weight: 700;
                    font-size: 1.1rem;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                .back-button:hover {
                    background: linear-gradient(45deg, var(--color-accent-green) 0%, var(--color-primary-medium) 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                }
                .back-button:active {
                    transform: translateY(0);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }

                .powered-by-placeholder {
                    margin-top: 50px;
                    color: var(--color-text-dark);
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .powered-by-logo {
                    height: 24px;
                    vertical-align: middle;
                }
                `}
            </style>
            <div className="no-robot-container">
                <div className="no-robot-card">
                    <h1 className="no-robot-title">¡Atención!</h1>
                    <p className="no-robot-message">
                        Parece que aún no tienes ningún robot asignado a tu cuenta.
                        <br /><br />
                        Por favor, contacta con tu profesor para que te vincule un robot y puedas empezar a jugar.
                    </p>
                    <button onClick={handleGoBack} className="back-button">
                        <BackIcon size={20} color="white" /> Volver al Inicio
                    </button>
                </div>
                
                {/* Desarrollado por CESGA */}
                <div className="powered-by-placeholder">
                    Desarrollado por 
                    <img 
                        src={cesgaLogo} 
                        alt="Logo de CESGA" 
                        className="powered-by-logo"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x24/CCCCCC/333333?text=Error+Logo'; }}
                    />
                </div>
            </div>
        </>
    );
};

export default NoRobotAssigned;
