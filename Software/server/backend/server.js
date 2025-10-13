const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const config = require('./config');

const app = express();
const port = 8889;

// --- Define corsOptions BEFORE app.use(cors) ---
const corsOptions = {
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Optional, for preflight
app.options('*', cors(corsOptions));

app.use(express.json());

const SECRET = 'tu_secreto'; // Consider moving this to a config file or environment variable

// DB Usuarios
const dbUsuarios = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'contrasena',
  database: 'usuariosDB'
});

// DB Vinculacion
const dbVinculacion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'contrasena',
  database: 'vinculacion_raspberry'
});

// --- LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body; // 'email' aquí es el identificador, que puede ser un email o nombre de usuario
  
    // Primero, busca el usuario en la tabla 'users'
    dbUsuarios.query('SELECT email, password, nivel FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error("Error al consultar la base de datos para login:", err);
        return res.status(500).send({ error: 'Error en el servidor.' });
      }
      if (results.length === 0) {
        return res.status(401).send({ error: 'Usuario o contraseña incorrectos.' });
      }
  
      const user = results[0];
  
      // Si la contraseña en la DB es NULL (no establecida), no permite el login
      if (user.password === null) {
          return res.status(401).send({ error: 'Contraseña no establecida. Por favor, regístrate o establece una.' });
      }
  
      // Compara la contraseña proporcionada con la contraseña hasheada
      bcrypt.compare(password, user.password, async (err, match) => { // 'async' aquí es importante
        if (err) {
          console.error("Error al comparar contraseñas:", err);
          return res.status(500).send({ error: 'Error en el servidor.' });
        }
  
        if (match) {
          const nivel = user.nivel;
          const token = jwt.sign({ email: user.email, nivel }, SECRET); // Usa user.email para el token
  
          // Si el usuario es de nivel 3 (alumno), busca su robot vinculado
          if (nivel === 3) {
            dbVinculacion.query('SELECT codigo_vinculacion FROM dispositivos WHERE email_alumno = ?', [user.email], (err, robotResults) => {
              if (err) {
                console.error("Error al buscar robot vinculado:", err);
                return res.status(500).send({ error: 'Error en el servidor al buscar robot.' });
              }
              
              let robotId = null;
              if (robotResults.length > 0) {
                robotId = robotResults[0].codigo_vinculacion;
              }
              // Devuelve el robotId si existe, o null si no
              res.send({ token, nivel, robotId });
            });
          } else {
            // Para otros niveles, solo devuelve token y nivel
            res.send({ token, nivel });
          }
        } else {
          res.status(401).send({ error: 'Usuario o contraseña incorrectos.' });
        }
      });
    });
  });
app.post('/api/admin/check-or-register-student-user', async (req, res) => {
    const { identifier, professorEmail } = req.body; // Recibe el identificador y el email del profesor
    const token = req.headers.authorization?.split(' ')[1]; // Obtiene el token del profesor

    if (!token) {
        return res.status(401).json({ message: 'Token de autenticación faltante.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET); // Verifica el token del profesor
        // Asegúrate de que el token sea de un profesor (nivel 1 o 2)
        if (decoded.nivel !== 1 && decoded.nivel !== 2) {
            return res.status(403).json({ message: 'No autorizado. Solo profesores pueden realizar esta acción.' });
        }

        if (!identifier) {
            return res.status(400).json({ message: 'Identificador de alumno es requerido.' });
        }

        // 1. Buscar si el usuario ya existe por su 'email' (que ahora puede ser un nombre de usuario)
        const checkUserQuery = 'SELECT email, password, nivel FROM users WHERE email = ?';
        dbUsuarios.query(checkUserQuery, [identifier], async (err, results) => {
            if (err) {
                console.error('Error al buscar usuario en DB:', err);
                return res.status(500).json({ message: 'Error en el servidor al verificar usuario.' });
            }

            if (results.length > 0) {
                // El usuario ya existe
                const user = results[0];
                return res.json({ 
                    exists: true, 
                    hasPassword: user.password !== null && user.password !== '', 
                    userEmail: user.email // Devuelve el email real de la DB
                });
            } else {
                // El usuario NO existe, procedemos a registrarlo
                // Registra con password = NULL y nivel 3 (alumno), vinculado al profesor
                const insertUserQuery = 'INSERT INTO users (email, password, nivel, alumno_de) VALUES (?, ?, ?, ?)';
                dbUsuarios.query(insertUserQuery, [identifier, null, 3, professorEmail], (err, insertResult) => {
                    if (err) {
                        console.error('Error al registrar nuevo alumno en DB:', err);
                        // Manejar error si el email/identificador ya existe (UNIQUE constraint)
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ message: 'El nombre de usuario/email ya está en uso.' });
                        }
                        return res.status(500).json({ message: 'Error en el servidor al registrar alumno.' });
                    }
                    return res.json({ 
                        exists: false, 
                        registeredNew: true, 
                        userEmail: identifier // Devuelve el identificador que se usó para registrar
                    });
                });
            }
        });

    } catch (error) {
        console.error('Error de autenticación o token inválido:', error);
        return res.status(401).json({ message: 'Token inválido o no autorizado.' });
    }
});

// --- Endpoint para Verificar Usuario (Registro) ---
// This endpoint is called by the frontend to check if an 'identifier' (email/username)
// exists in the database and if it has a password already set.
app.post('/api/check-user', (req, res) => {
  const { identifier } = req.body; // The frontend sends 'identifier'

  if (!identifier) {
    return res.status(400).json({ message: 'Identificador de usuario es requerido.' });
  }

  // Searches for the user in the 'users' table by the 'email' column.
  // If your primary identification column is 'email' (as in your table),
  // ensure the 'identifier' sent by the frontend is the email.
  // If you also want to search by a different 'username', you would need a 'username' column
  // in your table and adjust this query to search in both columns.
  const query = 'SELECT email, password, nivel FROM users WHERE email = ?';

  dbUsuarios.query(query, [identifier], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos para check-user:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    if (results.length > 0) {
      const user = results[0];
      // exists: true if the user is found
      // hasPassword: true if the 'password' column is not NULL and is not empty
      res.json({ exists: true, hasPassword: user.password !== null && user.password !== '', userNivel: user.nivel });
    } else {
      // User not found
      res.json({ exists: false });
    }
  });
});

// --- Endpoint para Registrar/Actualizar Contraseña ---
// This endpoint is called by the frontend to set a password for an existing user
// who does not have one (password is NULL) or to update it.
app.post('/api/register-update-password', async (req, res) => {
  const { identifier, password } = req.body; // The frontend sends 'identifier' and the new 'password'

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identificador y contraseña son requeridos.' });
  }

  try {
    // Hash the new password before saving it to the database.
    // This is CRUCIAL for security.
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt cost, a secure value

    // First, verify if the user exists to update their password.
    // We only allow setting/updating passwords for users who already exist.
    const checkUserQuery = 'SELECT id, nivel FROM users WHERE email = ?'; // Search by 'email'
    dbUsuarios.query(checkUserQuery, [identifier], (err, results) => {
      if (err) {
        console.error('Error al verificar usuario para actualizar contraseña:', err);
        return res.status(500).json({ message: 'Error en el servidor.' });
      }

      if (results.length > 0) {
        // User exists, proceed to update their password.
        const userLevel = results[0].nivel; // Keep the existing user level
        const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
        dbUsuarios.query(updateQuery, [hashedPassword, identifier], (err) => {
          if (err) {
            console.error('Error al actualizar contraseña:', err);
            return res.status(500).json({ message: 'Error al actualizar la contraseña.' });
          }
          // In a real application, you would generate a JWT (JSON Web Token) here
          // to authenticate the user immediately after setting the password.
          const token = 'mock_jwt_token_for_update_' + identifier; // Example token
          res.json({ success: true, message: 'Contraseña establecida con éxito.', nivel: userLevel, token });
        });
      } else {
        // If the user does not exist, direct registration is not allowed from this route.
        // This is consistent with your frontend logic that first checks for existence.
        res.status(404).json({ success: false, message: 'El usuario no existe para establecer una contraseña.' });
      }
    });

  } catch (error) {
    console.error('Error al hashear contraseña o en la operación de DB:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/dispositivos/registrar', (req, res) => {
  const { serial, codigo, email_alumno } = req.body;
  if (!serial || !codigo) {
    return res.status(400).send('Faltan campos obligatorios');
  }
  const sql = `
    INSERT INTO dispositivos (serial, codigo_vinculacion, email_alumno)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE codigo_vinculacion = VALUES(codigo_vinculacion), email_alumno = VALUES(email_alumno)
  `;
  dbVinculacion.query(sql, [serial, codigo, email_alumno || null], (err, result) => {
    if (err) {
      console.error("Error al registrar dispositivo:", err);
      return res.status(500).send('Error en el servidor');
    }
    res.send({ mensaje: 'Dispositivo registrado o actualizado correctamente' });
  });
});

app.post('/api/admin/registrar', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.nivel !== 1 && decoded.nivel !== 2) return res.status(403).send('No autorizado');
    const { email, password, alumno_de, nivel } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (email, password, nivel, alumno_de) VALUES (?, ?, ?, ?)';
    dbUsuarios.query(sql, [email, hash, nivel || 3, alumno_de || null], (err) => {
      if (err) {
        console.error("Error al registrar:", err);
        return res.status(500).send('Error al registrar usuario');
      }
      res.send({ mensaje: 'Usuario registrado' });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

app.get('/api/admin/dispositivos', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.nivel !== 1) return res.status(403).send('No autorizado');
    const sql = 'SELECT codigo_vinculacion, nombre_personalizado, email_profesor FROM dispositivos';
    dbVinculacion.query(sql, async (err, results) => {
      if (err) return res.status(500).send('Error al obtener dispositivos');
      const verificados = await Promise.all(results.map(async (robot) => {
        try {
          const estadoRes = await fetch(`${config.API_URL}/api/estado/${robot.codigo_vinculacion}`);
          const data = await estadoRes.json();
          return { ...robot, estado: data.estado };
        } catch {
          return { ...robot, estado: 'desconocido' };
        }
      }));
      res.json(verificados);
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

app.get('/api/usuario/alumnos', (req, res) => {
  const emailProfesor = req.query.email_profesor;
  dbUsuarios.query('SELECT email, alumno_de FROM users WHERE alumno_de = ?', [emailProfesor], (err, results) => {
    if (err) {
      console.error('Error al obtener alumnos:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.json(results);
  });
});

// GET /api/dispositivos/por-sufijo/:sufijo
app.get('/api/dispositivos/por-sufijo/:sufijo', async (req, res) => {
  const sufijo = req.params.sufijo;
  // This line might cause an error if 'db' is not defined. Assuming it should be 'dbVinculacion'
  // Or if you intend to use a promise-based connection.
  try {
    const [rows] = await dbVinculacion.promise().query( // Changed to dbVinculacion and added .promise()
      'SELECT * FROM dispositivos WHERE RIGHT(serial, 6) = ?',
      [sufijo]
    );
    if (rows.length > 0) return res.json(rows[0]);
    res.status(404).send('No encontrado');
  } catch (error) {
    console.error('Error al obtener dispositivo por sufijo:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.delete('/api/usuario/alumno/:email', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.nivel !== 2 && decoded.nivel !== 1) return res.status(403).send('No autorizado');
    const email = req.params.email;
    dbUsuarios.query('DELETE FROM users WHERE email = ?', [email], (err) => {
      if (err) {
        console.error("Error al eliminar alumno:", err);
        return res.status(500).send('Error al eliminar alumno');
      }
      res.send({ mensaje: 'Alumno eliminado correctamente' });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

app.get('/api/usuario/existe/:email', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.nivel !== 1 && decoded.nivel !== 2) return res.status(403).send('No autorizado');
    const email = req.params.email;
    dbUsuarios.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).send('Error al verificar alumno');
      res.json({ existe: results.length > 0 });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

// robots vinculados a ese email
app.get('/api/usuario/robots', (req, res) => {
  const email = req.query.email;
  dbVinculacion.query(
    'SELECT codigo_vinculacion, nombre_personalizado FROM dispositivos WHERE email_profesor = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error("Error al obtener robots:", err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      const robots = results.map(robot => ({
        codigo_vinculacion: robot.codigo_vinculacion,
        nombre_personalizado: robot.nombre_personalizado,
        estado: 'desconocido' // This status is not determined here, it's a placeholder
      }));
      res.json(robots);
    }
  );
});

app.get('/api/admin/usuarios', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.nivel !== 1) return res.status(403).send('No autorizado');
    dbUsuarios.query('SELECT email, nivel FROM users WHERE nivel = 2 OR nivel = 3', (err, results) => {
      if (err) return res.status(500).send('Error al obtener usuarios');
      res.json(results);
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

// --- Vincular dispositivo desde web ---
app.post('/api/dispositivos/vincular', (req, res) => {
  const { codigo, nombre } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    const email = decoded.email;
    const sql = 'UPDATE dispositivos SET email_profesor = ?, nombre_personalizado = ? WHERE codigo_vinculacion = ?';
    dbVinculacion.query(sql, [email, nombre, codigo], (err, result) => {
      if (err || result.affectedRows === 0) return res.status(400).send('No se pudo vincular');
      res.send({ mensaje: 'Dispositivo vinculado correctamente' });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

// --- Obtener lista de dispositivos del usuario ---
app.get('/api/dispositivos', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    const email = decoded.email;
    const sql = 'SELECT codigo_vinculacion, nombre_personalizado, email_profesor, email_alumno FROM dispositivos WHERE email_profesor = ?';
    dbVinculacion.query(sql, [email], (err, results) => {
      if (err) return res.status(500).send('Error al obtener dispositivos');
      res.json(results);
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

app.get('/api/quien-soy', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token faltante' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ email: decoded.email });
  } catch (err) {
    console.error('Token inválido:', err);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// PUT: actualizar nombre + email_alumno
app.put('/api/dispositivos/:codigo', (req, res) => {
  const { nombre, email_alumno } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    const email = decoded.email;
    const sql = `
      UPDATE dispositivos
      SET nombre_personalizado = ?, email_alumno = ?
      WHERE codigo_vinculacion = ? AND email_profesor = ?
    `;
    dbVinculacion.query(sql, [nombre, email_alumno, req.params.codigo, email], (err, result) => {
      if (err || result.affectedRows === 0) {
        console.error("Error al actualizar robot:", err);
        return res.status(400).send('No se pudo actualizar');
      }
      res.send({ mensaje: 'Robot actualizado' });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

// --- Eliminar dispositivo ---
app.delete('/api/dispositivos/:codigo', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token faltante');
  try {
    const decoded = jwt.verify(token, SECRET);
    const email = decoded.email;
    const sql = 'DELETE FROM dispositivos WHERE codigo_vinculacion = ? AND email_profesor = ?';
    dbVinculacion.query(sql, [req.params.codigo, email], (err, result) => {
      if (err || result.affectedRows === 0) return res.status(400).send('No se pudo eliminar el dispositivo');
      res.send({ mensaje: 'Dispositivo eliminado' });
    });
  } catch (err) {
    console.error('Token inválido:', err);
    return res.status(401).send('Token inválido');
  }
});

// --- HTML page video embebido ---
app.get('/video/:codigo', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'video.html');
  res.sendFile(htmlPath);
});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/api/estado/:codigo', (req, res) => {
  const { codigo } = req.params;
  const estaConectada = !!cameras[codigo];
  res.json({ estado: estaConectada ? 'conectado' : 'desconocido' });
});

// --- SOCKET.IO OVER HTTP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

let cameras = {}; // { id: socket }
let viewers = {}; // { id: [sockets] }

io.on('connection', socket => {
  console.log('Cliente conectado');

  // joystick: reemite al socket de la camara correspondiente
  socket.on('joystick', data => {
    // data must include { angle, force, id }
    const cam = cameras[data.id];
    if (cam) cam.emit('joystick', { angle: data.angle, force: data.force });
  });

  // emocion: reemite a la camara
  socket.on('emocion', data => {
    // data must include { emocion, id }
    const cam = cameras[data.id];
    if (cam) cam.emit('emocion', { emocion: data.emocion });
  });

  // audio-stream: reemite el binario a la camara
  socket.on('audio-stream', (chunk, id) => {
    // assuming you emit socket.emit('audio-stream', chunk, id)
    const cam = cameras[id];
    if (cam) cam.emit('audio-stream', chunk);
  });

  socket.on('register', ({ role, id }) => {
    if (role === 'camera') {
      cameras[id] = socket;
    } else if (role === 'viewer') {
      if (!viewers[id]) viewers[id] = [];
      viewers[id].push(socket);
    }
  });

  socket.on('offer', ({ sdp, type, id }) => {
    const camera = cameras[id];
    if (camera) camera.emit('offer', { sdp, type, id });
  });

  socket.on('answer', ({ sdp, type, id }) => {
    if (viewers[id]) viewers[id].forEach(v => v.emit('answer', { sdp, type }));
  });

  // Alternative WebRTC handling via WebSocket (without fetch)
  socket.on('webrtc-offer', ({ sdp, type, id }) => {
    const cam = cameras[id];
    if (cam) {
      console.log(`➡️ Redirigiendo webrtc-offer a camara ${id}`);
      cam.emit('webrtc-offer', { sdp, type, id });
    } else {
      console.warn(`❌ Camara ${id} no conectada`);
    }
  });

  socket.on('webrtc-answer', ({ sdp, type, id }) => {
    const clientSockets = viewers[id];
    if (clientSockets && clientSockets.length > 0) {
      console.log(`⬅️ Redirigiendo webrtc-answer al viewer ${id}`);
      clientSockets.forEach(viewer => {
        viewer.emit('webrtc-answer', { sdp, type });
      });
    } else {
      console.warn(`❌ Viewer para ${id} no encontrado`);
    }
  });

  socket.on('candidate', ({ candidate, sdpMid, sdpMLineIndex, id }) => {
    if (cameras[id]) {
      cameras[id].emit('candidate', { candidate, sdpMid, sdpMLineIndex, id });
    }
    if (viewers[id]) {
      viewers[id].forEach(v => v.emit('candidate', { candidate, sdpMid, sdpMLineIndex, id }));
    }
  });

  socket.on('disconnect', () => {
    for (const [id, camSocket] of Object.entries(cameras)) {
      if (camSocket === socket) {
        delete cameras[id];
        break;
      }
    }
    for (const [id, socketList] of Object.entries(viewers)) {
      viewers[id] = socketList.filter(v => v !== socket);
    }
  });
});

const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`API corriendo en ${config.API_URL} y localmente en http://0.0.0.0:${port}`);
});