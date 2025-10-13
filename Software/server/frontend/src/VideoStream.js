import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import nipplejs from 'nipplejs';

// --- CSS INCORPORADO DIRECTAMENTE (Paleta de colores mejorada y glassmorphism) ---
const embeddedCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    /* Backgrounds & Base Text */
    --color-bg-dark: #1A202C; /* Dark Slate Blue */
    --color-bg-light: #F0F4F8; /* Soft Off-White */
    --color-text-light: #E2E8F0; /* Light Grayish Blue for text */
    --color-text-dark: #2D3748; /* Dark Gray for contrast */

    /* Primary Accent - Techy Blue/Cyan */
    --color-accent-primary: #00BCD4; /* Vibrant Cyan */
    --color-accent-primary-hover: #00A3B8; /* Slightly darker cyan */

    /* Secondary Accent - Playful Pink/Purple */
    --color-accent-secondary: #EC4899; /* Bright Pink */
    --color-accent-secondary-hover: #DB2777; /* Deeper Pink */

    /* Brand/Status Colors */
    --color-brand-green: #10B981; /* Emerald Green (Active/Success) */
    --color-brand-yellow: #F59E0B; /* Amber (Warning/Highlight) */
    --color-brand-orange: #F97316; /* Orange (Attention) */
    --color-brand-red: #EF4444; /* Red (Error/Muted) */

    /* Glassmorphism */
    --color-glass-bg: rgba(26, 32, 44, 0.7); /* From --color-bg-dark */
    --color-glass-border: rgba(226, 232, 240, 0.3); /* From --color-text-light */
    --color-glass-hover: rgba(26, 32, 44, 0.8); /* Slightly less transparent on hover */

    /* Joystick */
    --color-joystick-base: rgba(0, 188, 212, 0.7); /* From --color-accent-primary */
    --color-joystick-stick: rgba(226, 232, 240, 0.9); /* From --color-text-light */
  }

  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    color: var(--color-text-light);
  }

  .viewer-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    /* Gradiente de fondo más dinámico */
    background: linear-gradient(to bottom right, var(--color-bg-dark), var(--color-accent-primary));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }

  .main-ui-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    z-index: 1; /* Keeping it low, individual controls will have higher z-index */
    padding: 1rem;
    box-sizing: border-box;
  }

  /* Top Bar */
  .top-bar {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: auto;
    z-index: 100; /* Higher z-index to be above everything, including joystick */
    pointer-events: auto; /* Ensure clicks pass through to children */
  }

  .logout-button {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: var(--color-accent-secondary);
    color: white;
    font-weight: bold;
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    transform: scale(1) translateY(0);
    border: none;
    cursor: pointer;
    pointer-events: auto;
  }
  .logout-button:hover {
    background-color: var(--color-accent-secondary-hover);
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  }
  .logout-button svg {
    height: 1.25rem;
    width: 1.25rem;
    margin-right: 0.5rem;
  }

  .user-robot-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background-color: var(--color-glass-bg);
    padding: 0.75rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-glass-border);
    font-size: 0.875rem;
    font-weight: 600;
    z-index: 100;
    pointer-events: auto;
  }
  .user-robot-info span:last-child {
    color: var(--color-accent-primary);
  }

  /* Nueva estructura: Contenedor del marco del video */
  .video-frame-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* width and height will be set by JS */
    border: 5px solid var(--color-accent-primary);
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px var(--color-accent-primary);
    overflow: hidden;
    z-index: 5;
    transition: all 0.3s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-frame-container:hover {
    transform: translate(-50%, -50%) scale(1.01);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 25px var(--color-accent-primary); /* More intense glow */
  }

  /* Video stream internal, inside the frame */
  .video-stream {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    pointer-events: none;
  }

  .video-stream::-webkit-media-controls {
    display: none !important;
  }

  /* Nueva zona para el joystick */
  .joystick-zone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    touch-action: none; /* Crucial for joystick to work correctly */
  }

  /* Nipplejs will inject its own divs. Style them here. */
  .nipple-fade {
    background-color: var(--color-joystick-base) !important;
    border: 5px solid rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 0 15px var(--color-accent-primary) !important; /* Use primary accent for glow */
  }
  .nipple-fade > .front {
    background-color: var(--color-joystick-stick) !important;
    border: 5px solid rgba(255, 255, 255, 1) !important;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8) !important;
  }


  /* Emoji Controls */
  .emoji-controls-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    z-index: 100;
    pointer-events: auto;
  }
  .emoji-toggle-button {
    padding: 0.75rem;
    background-color: var(--color-accent-secondary);
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    transform: scale(1) translateY(0);
    margin-bottom: 0.5rem;
    border: none;
    cursor: pointer;
    pointer-events: auto;
  }
  .emoji-toggle-button:hover {
    background-color: var(--color-accent-secondary-hover);
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  }
  .emoji-toggle-button svg {
    height: 1.5rem;
    width: 1.5rem;
    color: white;
  }

  .emoji-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background-color: var(--color-glass-bg);
    padding: 0.75rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-glass-border);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    pointer-events: auto;
  }
  .emoji-panel.hidden-panel {
    opacity: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }
  .emoji-panel.visible-panel {
    opacity: 1;
    transform: translateX(0);
  }

  .emoji-button {
    padding: 0.5rem;
    border-radius: 9999px;
    background-color: rgba(255, 255, 255, 0.1); /* Lighter glass for buttons */
    transition: all 0.2s ease-in-out;
    transform: scale(0); /* Initial state for animation */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
    pointer-events: auto;
  }
  .emoji-button:hover {
    background-color: var(--color-accent-primary);
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  /* The emoji container within the button will now render the mini versions directly */
  .emoji-button .emoji-container-wrapper {
    width: 2.5rem; /* 40px */
    height: 2.5rem; /* 40px */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }


  /* Bottom Controls Bar */
  .bottom-controls-wrapper {
    position: absolute;
    /* bottom will be set dynamically via React inline style */
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;
    pointer-events: auto;
    transition: bottom 0.3s ease-in-out; /* Smooth transition for vertical movement */
  }

  .bottom-controls-toggle {
    padding: 0.75rem;
    background-color: var(--color-accent-secondary);
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    transform: scale(1) translateY(0);
    border: none;
    cursor: pointer;
    pointer-events: auto;
  }
  .bottom-controls-toggle:hover {
    background-color: var(--color-accent-secondary-hover);
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  }
  .bottom-controls-toggle svg {
    height: 1.5rem;
    width: 1.5rem;
    color: white;
    /* No transform here, path will change */
  }

  .bottom-controls-panel {
    display: flex;
    gap: 1rem;
    background-color: var(--color-glass-bg);
    padding: 1rem;
    border-radius: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-glass-border);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out;
    margin-top: 1rem; /* This creates the gap between toggle and panel */
    pointer-events: auto;
  }
  .bottom-controls-panel.hidden-panel {
    opacity: 0;
    transform: translateY(100%); /* Slide down and out */
    pointer-events: none;
    height: 0; /* Collapse height */
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
    margin-top: 0; /* No margin when hidden */
  }
  .bottom-controls-panel.visible-panel {
    opacity: 1;
    transform: translateY(0); /* Slide up to visible position */
    height: auto; /* Allow content to define height */
    padding: 1rem; /* Restore padding */
    margin-top: 1rem; /* Restore margin */
  }

  /* Control Button (Mic/Speaker) */
  .control-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), inset 0 2px 5px rgba(0, 0, 0, 0.2); /* Coin-like inner shadow */
    border: 2px solid rgba(255, 255, 255, 0.3); /* Coin-like border */
    transition: all 0.3s ease-in-out;
    transform: scale(1) translateY(0);
    cursor: pointer;
    pointer-events: auto;
  }
  .control-button:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  .control-button.muted {
    background-color: var(--color-brand-red); /* Red for muted */
    color: white;
  }
  .control-button.active {
    background-color: #27AE60; /* Vibrant green from the image */
    color: white;
  }
  .control-button svg {
    height: 2rem;
    width: 2rem;
  }
  .control-button span {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  /* Animación de pop para emojis */
  @keyframes emojiPop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  .emoji-panel.visible-panel .emoji-button {
    animation: emojiPop 0.3s ease-out forwards;
  }

  /* --- INICIO DE ESTILOS DE EMOJIS PERSONALIZADOS (Versión Mini) --- */
  /* Base para todos los emojis mini */
  .emoji-base-mini {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* Ojos base para emojis mini */
  .emoji-eye-mini {
    width: 8px; /* Scaled from 18px */
    height: 8px; /* Scaled from 18px */
    background-color: #333;
    border-radius: 50%;
    position: absolute;
    box-shadow: 0 0 2px rgba(0,0,0,0.2); /* Smaller shadow */
  }

  .emoji-eye-mini.left {
    left: 25%;
    top: 35%;
  }

  .emoji-eye-mini.right {
    right: 25%;
    top: 35%;
  }

  /* Boca base para emojis mini */
  .emoji-mouth-mini {
    background-color: transparent;
    border: 2px solid #333; /* Scaled from 4px */
    position: absolute;
  }

  /* Estilos específicos para el emoji Feliz (Mini) */
  .emoji-happy-mini {
    background-color: #8BC34A;
  }

  .emoji-happy-mini .emoji-eye-mini::before {
    content: '';
    position: absolute;
    width: 3px; /* Scaled from 6px */
    height: 3px; /* Scaled from 6px */
    background-color: white;
    border-radius: 50%;
    top: 1px; /* Scaled from 3px */
    left: 1px; /* Scaled from 3px */
    opacity: 0.8;
  }

  .emoji-happy-mini .emoji-mouth-mini {
    width: 17px; /* Scaled from 40px */
    height: 8px; /* Scaled from 20px */
    border: none;
    background-color: #333;
    border-radius: 0 0 17px 17px / 0 0 8px 8px; /* Scaled radii */
    bottom: 22%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Animación para el brillo de los ojos (adaptada para mini) */
  @keyframes sparkle-mini {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.9; }
      100% { transform: scale(1); opacity: 1; }
  }
  .emoji-happy-mini .emoji-eye-mini {
    animation: sparkle-mini 1.5s infinite alternate;
  }


  /* Estilos específicos para el emoji Triste (Mini) */
  .emoji-sad-mini {
    background-color: #64B5F6;
  }

  .emoji-sad-mini .emoji-eyebrow-mini {
    width: 10px; /* Scaled from 25px */
    height: 2px; /* Scaled from 5px */
    background-color: #333;
    position: absolute;
    border-radius: 1px; /* Scaled from 2px */
    transform-origin: center center;
  }

  .emoji-sad-mini .emoji-eyebrow-mini.left {
    left: 20%;
    top: 25%;
    transform: rotate(-15deg);
  }

  .emoji-sad-mini .emoji-eyebrow-mini.right {
    right: 20%;
    top: 25%;
    transform: rotate(15deg);
  }

  .emoji-sad-mini .emoji-mouth-mini {
    width: 17px; /* Scaled from 40px */
    height: 2px; /* Scaled from 5px */
    background-color: #333;
    border-radius: 1px; /* Scaled from 2px */
    position: absolute;
    bottom: 25%;
  }

  /* Estilos específicos para el emoji Enfadado (Mini) */
  .emoji-angry-mini {
    background-color: #FF6B6B;
  }

  .emoji-angry-mini .emoji-eyebrow-mini {
    width: 10px; /* Scaled from 25px */
    height: 2px; /* Scaled from 5px */
    background-color: #333;
    position: absolute;
    border-radius: 1px; /* Scaled from 2px */
    transform-origin: center center;
  }

  .emoji-angry-mini .emoji-eyebrow-mini.left {
    left: 20%;
    top: 30%;
    transform: rotate(15deg);
  }

  .emoji-angry-mini .emoji-eyebrow-mini.right {
    right: 20%;
    top: 30%;
    transform: rotate(-15deg);
  }

  .emoji-angry-mini .emoji-mouth-mini {
    width: 17px; /* Scaled from 40px */
    height: 8px; /* Scaled from 20px */
    background-color: transparent;
    border: 2px solid #333; /* Scaled from 4px */
    border-bottom: none;
    border-left: none;
    border-right: none;
    border-radius: 20px 20px 0 0 / 10px 10px 0 0; /* Scaled radii */
    position: absolute;
    bottom: 25%;
    transform: translateY(0);
  }

  /* Estilos específicos para el emoji Confundido (Mini) */
  .emoji-confused-mini {
    background-color: #FFB300;
  }

  .emoji-confused-mini .emoji-eye-mini.left {
    width: 8px; /* Scaled from 20px */
    height: 8px; /* Scaled from 20px */
    left: 22%;
    top: 35%;
  }

  .emoji-confused-mini .emoji-eye-mini.right {
    width: 7px; /* Scaled from 16px */
    height: 7px; /* Scaled from 16px */
    right: 22%;
    top: 38%;
  }

  .emoji-confused-mini .emoji-eyebrow-mini {
    width: 8px; /* Scaled from 20px */
    height: 2px; /* Scaled from 4px */
    background-color: #333;
    position: absolute;
    border-radius: 1px; /* Scaled from 2px */
  }

  .emoji-confused-mini .emoji-eyebrow-mini.left {
    left: 20%;
    top: 28%;
    transform: rotate(-5deg);
  }

  .emoji-confused-mini .emoji-eyebrow-mini.right {
    right: 20%;
    top: 26%;
    transform: rotate(5deg);
  }

  .emoji-confused-mini .emoji-mouth-mini {
    width: 15px; /* Scaled from 35px */
    height: 6px; /* Scaled from 15px */
    background-color: transparent;
    border: 2px solid #333; /* Scaled from 4px */
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0 0 20px 20px / 10px 10px 0 0; /* Scaled radii */
    position: absolute;
    bottom: 25%;
    transform: translateY(0);
    animation: confused-mouth-mini 2s infinite alternate;
  }

  @keyframes confused-mouth-mini {
      0% { border-radius: 0 0 20px 20px / 10px 10px 0 0; }
      50% { border-radius: 20px 20px 0 0 / 10px 10px 0 0; }
      100% { border-radius: 0 0 20px 20px / 10px 10px 0 0; }
  }

  /* Estilos específicos para el emoji Corazón (Mini) */
  .emoji-heart-mini {
    width: 20px; /* Scaled down further to fit better */
    height: 20px; /* Scaled down further to fit better */
    background-color: #E91E63;
    position: relative;
    transform: rotate(-45deg);
    border-radius: 0;
    box-shadow: 0 0 4px rgba(0,0,0,0.2);
    animation: heartbeat-mini 1.5s infinite ease-in-out;
    /* Centrar el corazón dentro de su contenedor de 40x40px */
    top: 0px; /* Ajuste para centrar verticalmente: (40px - 20px)/2 = 10px */
    left: 0px; /* Ajuste para centrar horizontalmente: (40px - 20px)/2 = 10px */
  }

  .emoji-heart-mini::before,
  .emoji-heart-mini::after {
    content: '';
    width: 20px; /* Scaled down further */
    height: 20px; /* Scaled down further */
    background-color: #E91E63;
    border-radius: 50%;
    position: absolute;
  }

  .emoji-heart-mini::before {
    top: -10px; /* Scaled from -30px (original 60px base) -> 20 * (-30/60) = -10 */
    left: 0;
  }

  .emoji-heart-mini::after {
    top: 0;
    left: 10px; /* Scaled from 30px (original 60px base) -> 20 * (30/60) = 10 */
  }

  /* Animación de latido para el corazón (adaptada para mini) */
  @keyframes heartbeat-mini {
    0% { transform: scale(1) rotate(-45deg); }
    25% { transform: scale(1.1) rotate(-45deg); }
    50% { transform: scale(1) rotate(-45deg); }
    75% { transform: scale(1.05) rotate(-45deg); }
    100% { transform: scale(1) rotate(-45deg); }
  }

  /* Estilos específicos para el emoji Aturdido (Mini) */
  .emoji-dazed-mini {
    background-color: #C6A7F5;
    animation: subtle-spin-mini 5s infinite linear;
  }

  .emoji-dazed-mini .emoji-dazed-eye-container-mini {
    width: 10px; /* Scaled from 24px */
    height: 10px; /* Scaled from 24px */
    background-color: white;
    border-radius: 50%;
    position: absolute;
    box-shadow: 0 0 2px rgba(0,0,0,0.2); /* Smaller shadow */
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emoji-dazed-mini .emoji-dazed-eye-container-mini.left {
    left: 20%;
    top: 35%;
  }

  .emoji-dazed-mini .emoji-dazed-eye-container-mini.right {
    right: 20%;
    top: 35%;
  }

  .emoji-dazed-mini .emoji-dazed-pupil-mini {
    width: 5px; /* Scaled from 12px */
    height: 5px; /* Scaled from 12px */
    background-color: #333;
    border-radius: 50%;
    position: absolute;
  }

  /* Animación para la pupila izquierda (adaptada para mini) */
  .emoji-dazed-mini .emoji-dazed-eye-container-mini.left .emoji-dazed-pupil-mini {
    animation: pupil-move-left-mini 3s infinite alternate ease-in-out;
  }

  /* Animación para la pupila derecha (adaptada para mini) */
  .emoji-dazed-mini .emoji-dazed-eye-container-mini.right .emoji-dazed-pupil-mini {
    animation: pupil-move-right-mini 3.5s infinite alternate ease-in-out;
  }

  @keyframes pupil-move-left-mini {
      0% { transform: translate(-2px, -2px); } /* Scaled from -4px */
      25% { transform: translate(2px, -1px); }  /* Scaled from 4px, -2px */
      50% { transform: translate(-1px, 2px); }  /* Scaled from -2px, 4px */
      75% { transform: translate(1.5px, 0.5px); } /* Scaled from 3px, 1px */
      100% { transform: translate(-2px, -2px); }
  }

  @keyframes pupil-move-right-mini {
      0% { transform: translate(2px, 2px); }  /* Scaled from 4px */
      25% { transform: translate(-2px, 1px); } /* Scaled from -4px, 2px */
      50% { transform: translate(1px, -2px); } /* Scaled from 2px, -4px */
      75% { transform: translate(-1.5px, -0.5px); } /* Scaled from -3px, -1px */
      100% { transform: translate(2px, 2px); }
  }

  .emoji-dazed-mini .emoji-mouth-mini {
    width: 17px; /* Scaled from 40px */
    height: 2px; /* Scaled from 5px */
    background-color: #333;
    border-radius: 1px; /* Scaled from 2px */
    position: absolute;
    bottom: 25%;
  }

  /* Animación de giro muy suave para el emoji base (adaptada para mini) */
  @keyframes subtle-spin-mini {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
  .emoji-dazed-mini {
    animation: subtle-spin-mini 5s infinite linear;
  }

  /* Estilos específicos para el emoji Guiño (Mini) */
  .emoji-wink-mini {
    background-color: #FFD700;
  }

  .emoji-wink-mini .emoji-eye-mini.left {
    width: 8px; /* Scaled from 18px */
    height: 8px; /* Scaled from 18px */
    background-color: #333;
    border-radius: 50%;
    position: absolute;
    left: 25%;
    top: 35%;
  }

  .emoji-wink-mini .emoji-eye-mini.right {
    width: 8px; /* Scaled from 18px */
    height: 8px; /* Scaled from 18px */
    background-color: #333;
    border-radius: 50%;
    position: absolute;
    right: 25%;
    top: 35%;
    animation: wink-animation-mini 4s infinite ease-in-out;
  }

  @keyframes wink-animation-mini {
      0%, 40%, 60%, 100% {
          height: 8px; /* Scaled from 18px */
          border-radius: 50%;
          transform: rotate(0deg);
          background-color: #333;
      }
      50% {
          height: 2px; /* Scaled from 5px */
          border-radius: 1px; /* Scaled from 2px */
          transform: rotate(-10deg);
          background-color: #333;
      }
  }

  .emoji-wink-mini .emoji-mouth-mini {
    width: 21px; /* Scaled from 50px */
    height: 10px; /* Scaled from 25px */
    background-color: transparent;
    border: 2px solid #333; /* Scaled from 4px */
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0 0 21px 21px / 10px 10px 0 0; /* Scaled radii */
    position: absolute;
    bottom: 25%;
    transform: translateY(0);
  }
  /* --- FIN DE ESTILOS DE EMOJIS PERSONALIZADOS (Versión Mini) --- */
`;

function VideoStream() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Estudiante Ejemplo');
  const [robotName, setRobotName] = useState('Avatiñ@');

  const videoAndCommandId = `robot_${id}`;
  const audioInId = id;
  const audioOutId = `${id}_audio`;

  const videoRef = useRef(null);
  const socketVideoRef = useRef(null);
  const pcVideoRef = useRef(null);
  const nipplejsInstanceRef = useRef(null); // Ref to store the nipplejs instance
  const joystickZoneRef = useRef(null); // NEW: Ref for the dedicated joystick zone

  const micStreamRef = useRef(null);
  const socketAudioInRef = useRef(null);
  const pcAudioInRef = useRef(null);

  const robotSpeakerAudioElementRef = useRef(null);
  const socketAudioOutRef = useRef(null);
  const pcAudioOutRef = useRef(null);

  const [muteMic, setMuteMic] = useState(true); // Changed to true for initial muted state
  const [muteSpeaker, setMuteSpeaker] = useState(false); // This will now control muting/unmuting the speaker
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojisReady, setEmojisReady] = useState(false); // State to control emoji animation

  // State for video container size
  const [videoContainerSize, setVideoContainerSize] = useState({ width: '100%', height: '100%' });

  // --- EFFECT to inject CSS ---
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(embeddedCSS));
    document.head.appendChild(styleElement);
    console.log('CSS injected successfully');

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // --- EFFECT to animate emojis when panel is shown ---
  useEffect(() => {
    if (showEmojiPanel) {
      // Small delay so that the panel transition is visible before animating the buttons
      const timer = setTimeout(() => {
        setEmojisReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setEmojisReady(false);
    }
  }, [showEmojiPanel]);

  // --- EFFECT 1: Video Stream (Robot to Browser) & Commands (Browser to Robot) ---
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    socketVideoRef.current = io(API_URL, { transports: ['websocket'] });

    socketVideoRef.current.on('connect', () => {
      console.log(`Socket Video/Commands connected with ID: ${videoAndCommandId}`);
      socketVideoRef.current.emit('register', { role: 'viewer', id: videoAndCommandId });
      initiateVideoConnection();
    });

    socketVideoRef.current.on('webrtc-offer', async data => {
      if (data.id !== videoAndCommandId) {
        console.warn(`Ignoring video offer from unknown ID: ${data.id}`);
        return;
      }
      console.log(`Video offer received from ${data.id}`);
      if (pcVideoRef.current && pcVideoRef.current.signalingState !== 'closed') {
        const desc = new RTCSessionDescription(data);
        await pcVideoRef.current.setRemoteDescription(desc);
        const answer = await pcVideoRef.current.createAnswer();
        await pcVideoRef.current.setLocalDescription(answer);
        socketVideoRef.current.emit('webrtc-answer', {
          id: videoAndCommandId,
          sdp: pcVideoRef.current.localDescription.sdp,
          type: pcVideoRef.current.localDescription.type
        });
        console.log(`Video answer sent to ${videoAndCommandId}`);
      }
    });

    socketVideoRef.current.on('answer', async data => {
      if (pcVideoRef.current && pcVideoRef.current.signalingState !== 'closed') {
        await pcVideoRef.current.setRemoteDescription(new RTCSessionDescription(data));
      }
    });

    socketVideoRef.current.on('candidate', async data => {
      if (pcVideoRef.current && pcVideoRef.current.signalingState !== 'closed' && data.candidate) {
        try {
          await pcVideoRef.current.addIceCandidate(new RTCIceCandidate(data));
        } catch (e) {
          console.error('Error adding ICE candidate for Video:', e);
        }
      }
    });

    pcVideoRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcVideoRef.current.addTransceiver('video', { direction: 'recvonly' });

    pcVideoRef.current.onicecandidate = ev => {
      if (ev.candidate) {
        socketVideoRef.current.emit('candidate', { id: videoAndCommandId, ...ev.candidate });
      }
    };

    pcVideoRef.current.ontrack = ev => {
      if (ev.track.kind === 'video' && videoRef.current) {
        videoRef.current.srcObject = ev.streams[0];
        console.log('🎥 Video track connected to video element.');

        videoRef.current.onloadedmetadata = () => {
            const videoElement = videoRef.current;
            const intrinsicWidth = videoElement.videoWidth;
            const intrinsicHeight = videoElement.videoHeight;

            if (intrinsicWidth && intrinsicHeight) {
              const aspectRatio = intrinsicWidth / intrinsicHeight;

              const mainUiContent = document.querySelector('.main-ui-content');
              const parentWidth = mainUiContent.offsetWidth;
              const parentHeight = mainUiContent.offsetHeight;

              let newWidth = parentWidth;
              let newHeight = parentHeight;

              if (newWidth / newHeight > aspectRatio) {
                  newWidth = newHeight * aspectRatio;
              } else {
                  newHeight = newWidth / aspectRatio;
              }

              setVideoContainerSize({ width: `${newWidth}px`, height: `${newHeight}px` });
              console.log(`Video container size set to: ${newWidth}x${newHeight}`);
            }
        };
      } else {
        console.warn('Received unexpected non-video track in Video/Commands connection:', ev.track.kind);
      }
    };

    async function initiateVideoConnection() {
      const offer = await pcVideoRef.current.createOffer();
      await pcVideoRef.current.setLocalDescription(offer);
      socketVideoRef.current.emit('offer', {
        id: videoAndCommandId,
        sdp: offer.sdp,
        type: offer.type
      });
    }

    return () => {
      if (pcVideoRef.current) pcVideoRef.current.close();
      if (socketVideoRef.current) socketVideoRef.current.disconnect();
    };
  }, [id, videoAndCommandId]);

  // --- EFFECT 2: Audio OUT (Robot to Browser) ---
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    socketAudioOutRef.current = io(API_URL, { transports: ['websocket'] });

    socketAudioOutRef.current.on('connect', () => {
      console.log(`Socket Audio OUT connected with ID: ${audioOutId}`);
      socketAudioOutRef.current.emit('register', { role: 'viewer', id: audioOutId });
      initiateAudioOutConnection();
    });

    socketAudioOutRef.current.on('answer', async data => {
      if (pcAudioOutRef.current && pcAudioOutRef.current.signalingState !== 'closed') {
        await pcAudioOutRef.current.setRemoteDescription(new RTCSessionDescription(data));
      }
    });

    socketAudioOutRef.current.on('candidate', async data => {
      if (pcAudioOutRef.current && pcAudioOutRef.current.signalingState !== 'closed' && data.candidate) {
        try {
          await pcAudioOutRef.current.addIceCandidate(new RTCIceCandidate(data));
        } catch (e) {
          console.error('Error adding ICE candidate for Audio OUT:', e);
        }
      }
    });

    pcAudioOutRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcAudioOutRef.current.addTransceiver('audio', { direction: 'recvonly' });

    pcAudioOutRef.current.onicecandidate = ev => {
      if (ev.candidate) {
        socketAudioOutRef.current.emit('candidate', { id: audioOutId, ...ev.candidate });
      }
    };

    pcAudioOutRef.current.ontrack = ev => {
      if (ev.track.kind === 'audio') {
        const stream = ev.streams[0] || new MediaStream([ev.track]);
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        document.body.appendChild(audio);
        robotSpeakerAudioElementRef.current = audio;

        console.log('🎧 Audio OUT track connected to audio element.');
      } else {
        console.warn('Received unexpected non-audio track in Audio OUT connection:', ev.track.kind);
      }
    };

    async function initiateAudioOutConnection() {
      const offer = await pcAudioOutRef.current.createOffer();
      await pcAudioOutRef.current.setLocalDescription(offer);
      socketAudioOutRef.current.emit('offer', {
        id: audioOutId,
        sdp: offer.sdp,
        type: offer.type
      });
    }

    return () => {
      if (pcAudioOutRef.current) pcVideoRef.current.close();
      if (socketAudioOutRef.current) socketAudioOutRef.current.disconnect();
      if (robotSpeakerAudioElementRef.current) {
        robotSpeakerAudioElementRef.current.remove();
        robotSpeakerAudioElementRef.current = null;
      }
    };
  }, [id, audioOutId]);

  // --- EFFECT 3: Audio IN (Browser to Robot) ---
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    socketAudioInRef.current = io(API_URL, { transports: ['websocket'] });

    socketAudioInRef.current.on('connect', () => {
      console.log(`Socket Audio IN connected with ID: ${audioInId}`);
      socketAudioInRef.current.emit('register', { role: 'viewer', id: audioInId });
      initiateAudioInConnection();
    });

    socketAudioInRef.current.on('webrtc-answer', async data => {
      if (pcAudioInRef.current && pcAudioInRef.current.signalingState !== 'closed') {
        await pcAudioInRef.current.setRemoteDescription(new RTCSessionDescription(data));
      }
    });

    socketAudioInRef.current.on('candidate', async data => {
      if (pcAudioInRef.current && pcAudioInRef.current.signalingState !== 'closed' && data.candidate) {
        try {
          await pcAudioInRef.current.addIceCandidate(new RTCIceCandidate(data));
        } catch (e) {
          console.error('Error adding ICE candidate for Audio IN:', e);
        }
      }
    });

    pcAudioInRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcAudioInRef.current.addTransceiver('audio', { direction: 'sendrecv' });

    pcAudioInRef.current.onicecandidate = ev => {
      if (ev.candidate) {
        socketAudioInRef.current.emit('candidate', { id: audioInId, ...ev.candidate });
      }
    };

    pcAudioInRef.current.ontrack = ev => {
      if (ev.track.kind === 'audio') {
        console.log('🎧 Audio track (eco) received in Audio IN connection:', ev.track);
      } else {
        console.warn('Received unexpected non-audio track in Audio IN connection:', ev.track.kind);
      }
    };

    async function initiateAudioInConnection() {
      const offer = await pcAudioInRef.current.createOffer();
      await pcAudioInRef.current.setLocalDescription(offer);
      socketAudioInRef.current.emit('offer', {
        id: audioInId,
        sdp: offer.sdp,
        type: offer.type
      });
    }

    return () => {
      if (pcAudioInRef.current) pcAudioInRef.current.close();
      if (socketAudioInRef.current) socketAudioInRef.current.disconnect();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    };
  }, [id, audioInId]);

  // --- CONTROL FUNCTIONS ---
  const enviarEmoji = emoji => {
    console.log("Emitting emotion:", emoji, "id:", videoAndCommandId);
    // TODO: Implement sound effect when sending emoji
    // TODO: Implement visual confirmation animation for emoji
    if (socketVideoRef.current && socketVideoRef.current.connected) {
      socketVideoRef.current.emit("emocion", { emocion: emoji, id: videoAndCommandId });
    }
  };

  const enviarComando = (command) => {
    console.log("Emitting command:", command, "id:", videoAndCommandId);
    if (socketVideoRef.current && socketVideoRef.current.connected) {
      socketVideoRef.current.emit("comando", { comando: command, id: videoAndCommandId });
    }
  };

  const toggleMic = async () => {
    const newMuteState = !muteMic;
    setMuteMic(newMuteState);

    // TODO: Implement sound effect when activating/deactivating microphone
    const accion = newMuteState ? 'silenciar_microfono' : 'activar_microfono';
    if (socketAudioInRef.current && socketAudioInRef.current.connected) {
      socketAudioInRef.current.emit('audio-control', { accion, id: audioInId });
    }

    try {
      if (!newMuteState) {
        if (!micStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          stream.getAudioTracks().forEach(track => {
            pcAudioInRef.current.addTrack(track, stream);
            console.log('🎤 Browser mic track added to WebRTC (Audio IN)');
          });
        } else {
          micStreamRef.current.getTracks().forEach(track => track.enabled = true);
          console.log('🎤 Browser mic re-enabled.');
        }
      } else {
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(track => track.enabled = false);
          console.log('🎤 Browser mic disabled.');
        }
      }
    } catch (err) {
      console.error('Error accessing browser microphone:', err);
      setMuteMic(true); // Ensure state reflects muted if it fails
      // TODO: Show friendly error message to the user in the UI
    }
  };

  // This function now toggles the local speaker mute state
  const toggleSpeakerMute = () => {
    const newMuteState = !muteSpeaker;
    setMuteSpeaker(newMuteState);

    // No need to send audio-control command to robot for local mute
    if (robotSpeakerAudioElementRef.current) {
      robotSpeakerAudioElementRef.current.muted = newMuteState;
      console.log(`🔊 Local speaker ${newMuteState ? "muted" : "activated"}`);
    }
  };

  // --- EFFECT to initialize nipplejs (dynamic/semi mode) ---
  useEffect(() => {
    const initNipple = () => {
      // Only create nipplejs if it hasn't been created yet AND the joystickZoneRef is available
      if (!nipplejsInstanceRef.current && joystickZoneRef.current) {
        nipplejsInstanceRef.current = nipplejs.create({
          zone: joystickZoneRef.current, // IMPORTANT: Use the specific div as the zone
          mode: "semi",       // Semi-dynamic mode: joystick appears where touched
          color: 'var(--color-joystick-base)', // Use CSS variable for base color
          size: 200,          // Fixed size for the joystick
          threshold: 0.01,    // Sensitivity threshold for movement
          restJoystick: true, // Stick returns to center when released
          restOpacity: 0,     // *** KEY CHANGE: Set restOpacity to 0 for full fade out ***
          fadeTime: 2000,     // Fade out the joystick base after 2 seconds of inactivity
          // No need for 'exclude' here, as the zone itself is limited
        });
        console.log('Dynamic nipplejs instance created:', nipplejsInstanceRef.current);

        // Event listener for joystick movement
        nipplejsInstanceRef.current.on("move", (_, data) => {
          // Emit joystick data only when there's actual movement
          if (socketVideoRef.current && socketVideoRef.current.connected) {
            socketVideoRef.current.emit("joystick", {
              angle: data.angle ? data.angle.degree : 0,
              force: data.force || 0,
              id: videoAndCommandId
            });
          }
        });

        // Event listener for joystick release (end of interaction)
        nipplejsInstanceRef.current.on("end", () => {
          // When joystick is released, send zero force to stop the robot
          if (socketVideoRef.current && socketVideoRef.current.connected) {
            socketVideoRef.current.emit("joystick", {
              angle: 0,
              force: 0,
              id: videoAndCommandId
            });
          }
        });

        // Optional: Add visual feedback for start
        nipplejsInstanceRef.current.on("start", () => {
          console.log("Joystick interaction started.");
        });
      }
    };

    // Initialize nipplejs after a short delay to ensure DOM is ready and ref is attached
    const timer = setTimeout(initNipple, 500); // 500ms delay

    // Cleanup function for when the component unmounts
    return () => {
      clearTimeout(timer); // Clear the timeout if component unmounts before it fires
      if (nipplejsInstanceRef.current) {
        nipplejsInstanceRef.current.destroy(); // Destroy the nipplejs instance
        nipplejsInstanceRef.current = null;
        console.log('Dynamic nipplejs instance destroyed on component unmount.');
      }
    };
  }, [id, videoAndCommandId]); // Dependency array includes id and videoAndCommandId for socket usage


  return (
    <div className="viewer-container">
      <div className="main-ui-content">

        {/* Top Bar: Logout & User/Robot Info */}
        <div className="top-bar">
          <button
            onClick={() => navigate("/")}
            className="logout-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.354 9.646a.5.5 0 010-.708l3-3a.5.5 0 01.708.708L13.707 12l2.354 2.354a.5.5 0 01-.708.708l-3-3a.5.5 0 01-.708 0z" clipRule="evenodd" />
            </svg>
            Cerrar Sesión
          </button>

          <div className="user-robot-info">
            <span>{userName}</span>
            <span style={{ color: 'var(--color-accent-primary)' }}>Robot: {robotName} ({id})</span>
          </div>
        </div>

        {/* Video Stream Container with dynamic sizing */}
        <div className="video-frame-container" style={videoContainerSize}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="video-stream"
          />
        </div>

        {/* NEW: Dedicated Joystick Zone */}
        {/* This div will be the only area where nipplejs listens for touches */}
        <div className="joystick-zone" ref={joystickZoneRef}></div>


        {/* Emoji Controls */}
        <div className="emoji-controls-wrapper">
          <button
            onClick={() => setShowEmojiPanel(!showEmojiPanel)}
            className="emoji-toggle-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <div className={`emoji-panel ${showEmojiPanel ? 'visible-panel' : 'hidden-panel'}`}>
            <EmojiButton emojiKey="happy" label="Feliz" onClick={() => enviarEmoji("feliz")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="sad" label="Triste" onClick={() => enviarEmoji("triste")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="angry" label="Enfadado" onClick={() => enviarEmoji("enfadado")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="confused" label="Confundido" onClick={() => enviarEmoji("confundido")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="heart" label="Corazón" onClick={() => enviarEmoji("corazon")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="dazed" label="Aturdido" onClick={() => enviarEmoji("aturdido")} emojisReady={emojisReady} />
            <EmojiButton emojiKey="wink" label="Guiño" onClick={() => enviarEmoji("guino")} emojisReady={emojisReady} />
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div
          className="bottom-controls-wrapper"
          // Calculate the height of the panel to position the button correctly
          // When collapsed, only button is visible at 0px from bottom.
          // When expanded, the panel needs to be fully visible, so the button moves up.
          // The panel's height is dynamic, but the button itself is fixed height (3rem = 48px) + padding.
          // Let's assume the panel + its margin-top is roughly 7rem (112px)
          style={{ bottom: isControlsExpanded ? '1rem' : '0px' }}
        >
          <button
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="bottom-controls-toggle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {/* Conditional path for arrow direction */}
              <path strokeLinecap="round" strokeLinejoin="round" d={isControlsExpanded ? "M19 9l-7 7-7-7" : "M19 15l-7-7-7 7"} />
            </svg>
          </button>
          <div className={`bottom-controls-panel ${isControlsExpanded ? 'visible-panel' : 'hidden-panel'}`}>
            <ControlButton
              icon={muteMic ? MicOffIcon : MicOnIcon} // Conditionally render mute/unmute icon for microphone
              label="Micrófono"
              onClick={toggleMic}
              isMuted={muteMic}
            />
            <ControlButton
              icon={muteSpeaker ? SpeakerOffIcon : SpeakerOnIcon} // Conditionally render mute/unmute icon
              label="Altavoz Silenciar" // Changed label
              onClick={toggleSpeakerMute} // Changed handler
              isMuted={muteSpeaker}
            />
            <ControlButton
              icon={SearchPlusIcon}
              label="Zoom In"
              onClick={() => enviarComando("zoom_in")}
              isMuted={false}
            />
            <ControlButton
              icon={SearchMinusIcon}
              label="Zoom Out"
              onClick={() => enviarComando("zoom_out")}
              isMuted={false}
            />
            <ControlButton
              icon={SpeakerDownIcon}
              label="Altavoz Bajar"
              onClick={() => enviarComando("speaker_down")}
              isMuted={false}
            />
            <ControlButton
              icon={SpeakerOnIcon} // New button for Altavoz Subir
              label="Altavoz Subir"
              onClick={() => enviarComando("speaker_up")} // New command
              isMuted={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// Component for control buttons (microphone, speaker, new controls)
const ControlButton = ({ icon: Icon, label, onClick, isMuted }) => (
  <button
    onClick={onClick}
    className={`control-button ${isMuted ? 'muted' : 'active'}`}
  >
    <Icon />
    <span>{label}</span>
  </button>
);

// Component for emoji buttons
const EmojiButton = ({ emojiKey, label, onClick, emojisReady }) => {
  const EmojiComponent = EmojiIcons[emojiKey]; // Get the React component for the emoji
  return (
    <button
      title={label}
      onClick={onClick}
      className="emoji-button"
      style={{ animationDelay: emojisReady ? `${EmojiDelays[emojiKey]}s` : '0s' }}
    >
      {/* Render the emoji component directly inside a wrapper div */}
      <div className="emoji-container-wrapper">
        <EmojiComponent />
      </div>
    </button>
  );
};

// Delays for emoji animation
const EmojiDelays = {
  happy: 0.05,
  sad: 0.1,
  angry: 0.15,
  confused: 0.2,
  heart: 0.25,
  dazed: 0.3,
  wink: 0.35,
};

// --- Custom CSS-drawn Emojis (as React Components) - Now using -mini classes ---
const EmojiIcons = {
    happy: (props) => (
      <div className="emoji-base-mini emoji-happy-mini">
        <div className="emoji-eye-mini left"></div>
        <div className="emoji-eye-mini right"></div>
        <div className="emoji-mouth-mini"></div>
      </div>
    ),
    sad: (props) => (
      <div className="emoji-base-mini emoji-sad-mini">
        <div className="emoji-eyebrow-mini left"></div>
        <div className="emoji-eyebrow-mini right"></div>
        <div className="emoji-eye-mini left"></div>
        <div className="emoji-eye-mini right"></div>
        <div className="emoji-mouth-mini"></div>
      </div>
    ),
    angry: (props) => (
      <div className="emoji-base-mini emoji-angry-mini">
        <div className="emoji-eyebrow-mini left"></div>
        <div className="emoji-eyebrow-mini right"></div>
        <div className="emoji-eye-mini left"></div>
        <div className="emoji-eye-mini right"></div>
        <div className="emoji-mouth-mini"></div>
      </div>
    ),
    confused: (props) => (
      <div className="emoji-base-mini emoji-confused-mini">
        <div className="emoji-eyebrow-mini left"></div>
        <div className="emoji-eyebrow-mini right"></div>
        <div className="emoji-eye-mini left"></div>
        <div className="emoji-eye-mini right"></div>
        <div className="emoji-mouth-mini"></div>
      </div>
    ),
    heart: (props) => (
      <div className="emoji-heart-mini"></div>
    ),
    dazed: (props) => (
      <div className="emoji-base-mini emoji-dazed-mini">
        <div className="emoji-dazed-eye-container-mini left">
          <div className="emoji-dazed-pupil-mini"></div>
        </div>
        <div className="emoji-dazed-eye-container-mini right">
          <div className="emoji-dazed-pupil-mini"></div>
        </div>
        <div className="emoji-mouth-mini"></div>
      </div>
    ),
    wink: (props) => (
      <div className="emoji-base-mini emoji-wink-mini">
        <div className="emoji-eye-mini left"></div>
        <div className="emoji-eye-mini right"></div>
        <div class="emoji-mouth-mini"></div>
      </div>
    ),
  };

// --- SVG Icons for Microphone and Speaker (Kept as provided, but now use new color variables) ---
const MicOnIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2h-2v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" />
  </svg>
);

const MicOffIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2h-2v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2zM12 14v7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 1l22 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpeakerOnIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.98 7-4.99 7-8.77s-2.99-7.79-7-8.77z" />
  </svg>
);

const SpeakerOffIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .96-.21 1.87-.59 2.72l1.42 1.42c.72-1.61 1.17-3.41 1.17-5.14 0-4.01-2.99-7.79-7-8.77v2.06c3.07.87 5.34 3.54 5.34 6.71zM4.27 3L3 4.27l9 9V19c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-5H2l5-5 7.73 7.73L21.73 21 23 19.73 4.27 3zM9 4L6.93 6.07 9 8.14V4z" />
  </svg>
);

// --- NEW SVG Icons for additional controls (based on Font Awesome) ---
const SearchPlusIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    {/* Plus sign */}
    <rect x="7.5" y="9" width="4" height="1" />
    <rect x="9" y="7.5" width="1" height="4" />
  </svg>
);

const SearchMinusIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    {/* Minus sign */}
    <rect x="7.5" y="9" width="4" height="1" />
  </svg>
);

const SpeakerDownIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm-2.5 4.03v-8.05c1.48.73 2.5 2.25 2.5 4.02s-1.02 3.29-2.5 4.03zM3 9v6h4l5 5V4L7 9H3z" />
  </svg>
);

const InfoIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

export default VideoStream;
