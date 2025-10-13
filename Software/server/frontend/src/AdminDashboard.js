import { useEffect, useState } from 'react';
import axios from './axiosConfig';
import './AdminDashboard.css';

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  const token = localStorage.getItem('token');
  const nivel = localStorage.getItem('nivel');

  useEffect(() => {
    if (!token || parseInt(nivel) !== 1) {
      window.location.href = '/';
      return;
    }

    obtenerUsuarios();
    obtenerDispositivos();
    const interval = setInterval(obtenerDispositivos, 5000);
    return () => clearInterval(interval);
  }, []);

  const obtenerUsuarios = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsuarios(res.data);
  };

  const obtenerDispositivos = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dispositivos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDispositivos(res.data);
  };

  const registrarUsuario = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/registrar`, {
        email: nuevoEmail,
        password: nuevaPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Usuario registrado');
      setNuevoEmail('');
      setNuevaPassword('');
      obtenerUsuarios();
    } catch (err) {
      alert('❌ Error al registrar usuario');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nivel');
    window.location.href = '/';
  };

  const email = localStorage.getItem('email');

  return (
    <>
    <h1 className="titulo-admin">Panel de administración: {email}</h1>

      {/* Botón fuera del contenedor para evitar que su posición sea afectada */}
      <button className="logout-btn" onClick={cerrarSesion}>Cerrar sesión</button>
  
      <div className="admin-dashboard" style={{ backgroundImage: 'url("/fondo_amarillo.jpg")' }}>
        <div className="paneles">
          {/* IZQUIERDA */}
          <div className="panel panel-usuarios">
            <h2>👥 Usuarios de nivel 2</h2>
            <ul>
              {usuarios
                .filter(u => u.nivel === 2)
                .map((u, i) => (
                  <li key={i}>
                    <span>{u.email}</span>
                    <button onClick={() => window.location.href = `/usuario/${u.email}`}>🔍</button>
                  </li>
              ))}
            </ul>
          </div>
  
          {/* CENTRO */}
          <div className="panel panel-registrar">
            <h2>➕ Registrar Nivel 2</h2>
            <input
              placeholder="📧 Email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
            />
            <input
              placeholder="🔐 Contraseña"
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
            <button onClick={registrarUsuario}>Registrar</button>
          </div>
  
          {/* DERECHA */}
          <div className="panel panel-robots">
            <h2>🤖 Robots</h2>
            <ul>
              {dispositivos.map((r, i) => (
                <li key={i}>
                  <div><strong>{r.nombre_personalizado}</strong> ({r.codigo_vinculacion})</div>
                  <div>📧 {r.email_profesor}</div>
                  <div className={r.estado === 'conectado' ? 'on' : 'off'}>
                    {r.estado === 'conectado' ? '🟢 Conectado' : '⚫ Desconectado'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );  
}

export default AdminDashboard;
