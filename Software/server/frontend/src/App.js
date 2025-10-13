// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login"; // Tu componente de Login
import Dashboard from "./Dashboard";
import VideoStream from "./VideoStream";
import AdminDashboard from './AdminDashboard';
import UsuarioDetalle from './UsuarioDetalle';
import RegisterPage from "./RegisterPage"; 
import NoRobotAssigned from "./NoRobotAssigned"; // <--- NUEVO: Importa el componente NoRobotAssigned

import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stream/:id" element={<VideoStream />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/usuario/:email" element={<UsuarioDetalle />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/no-robot-assigned" element={<NoRobotAssigned />} /> {/* <--- NUEVO: Ruta para la página de "no robot asignado" */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
