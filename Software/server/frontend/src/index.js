// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'; // ¡IMPORTANTE: Añade esta línea para importar index.css!

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
