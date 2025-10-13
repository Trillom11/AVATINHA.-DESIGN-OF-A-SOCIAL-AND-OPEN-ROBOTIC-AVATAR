import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from './axiosConfig';
import './UsuarioDetalle.css';

function UsuarioDetalle() {
  const { email } = useParams();
  const [alumnos, setAlumnos] = useState([]);
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    console.log("Estado de alumnos actualizado:", alumnos);
    obtenerAlumnos();
    obtenerRobots();
  }, []);

  const obtenerAlumnos = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/usuario/alumnos?email_profesor=${email}`);
      console.log("Alumnos obtenidos:", res.data);
      setAlumnos(res.data);
    } catch (error) {
      console.error("❌ Error al obtener alumnos:", error);
    }
  };
  
  

  const obtenerRobots = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/usuario/robots?email=${email}`);
    setRobots(res.data);
  };

  return (
    <>
    <button className="volver" onClick={() => window.history.back()}>⬅️ Volver</button>
      <div className="usuario-detalle">
        <h1 className="titulo-usuario">👤 Panel de: {email}</h1>

        <div className="columnas">
          {/* COL 1: ALUMNOS */}
          <div className="columna alumnos">
            <h2>👶 Alumnos registrados:</h2>
            <ul>
              {alumnos.length > 0 ? (
                alumnos.map((a, i) => (
                  <li key={i} style={{ background: '#1c1c1c', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    📧 {a.email}
                  </li>
                ))
              ) : (
                <li>No hay alumnos registrados.</li>
              )}
            </ul>
          </div>

          {/* COL 2: ROBOTS */}
          <div className="columna robots">
            <h2>🤖 Robots Vinculados</h2>
            <ul>
              {robots.map((rb, i) => (
                <li key={i}>
                  <strong>{rb.nombre_personalizado}</strong> ({rb.codigo_vinculacion})<br />
                  Estado: {rb.estado === 'conectado' ? '🟢 Conectado' : '⚫ Desconectado'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default UsuarioDetalle;
