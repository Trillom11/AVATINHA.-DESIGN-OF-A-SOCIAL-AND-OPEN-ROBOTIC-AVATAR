import React, { useState } from 'react';
import axios from './axiosConfig';

function VincularRobot() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');

  const vincular = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('${process.env.REACT_APP_API_URL}/api/dispositivos/vincular', 
        { codigo, nombre }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Dispositivo vinculado correctamente');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <div>
      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input placeholder="Nombre del robot" value={nombre} onChange={e => setNombre(e.target.value)} />
      <button onClick={vincular}>Vincular</button>
    </div>
  );
}

export default VincularRobot;
