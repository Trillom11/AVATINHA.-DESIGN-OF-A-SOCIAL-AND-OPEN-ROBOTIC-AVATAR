import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';


function ListaRobots() {
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    const obtenerRobots = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('${process.env.REACT_APP_API_URL}/api/dispositivos/mis-robots', 
        { headers: { Authorization: `Bearer ${token}` } });
      setRobots(res.data);
    };
    obtenerRobots();
  }, []);

  return (
    <div>
      <h3>Robots asociados:</h3>
      <ul>
        {robots.map((robot, index) => (
          <li key={index}>{robot.nombre_robot}</li>
        ))}
      </ul>
    </div>
  );
}

export default ListaRobots;
