import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importa la imagen del logo directamente (asumiendo que está en la misma carpeta o accesible)
import cesgaLogo from './logo_cesga.png'; 

// --- Inline SVG Icons (Phosphor Icons inspired for consistency and modern look) ---
const RobotIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-40-88a12,12,0,1,1,12-12A12,12,0,0,1,88,128Zm80-12a12,12,0,1,1-12,12A12,12,0,0,1,168,116ZM128,164a28,28,0,1,1,28-28A28,28,0,0,1,128,164Z"></path>
    </svg>
);

const LinkIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M164,128a36,36,0,0,1-36,36H92a36,36,0,0,1,0-72h36A36,36,0,0,1,164,128Z"></path>
        <path d="M160,128a32,32,0,0,0-32-32H96a32,32,0,0,0,0,64h32A32,32,0,0,0,160,128Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
        <path d="M96,128a32,32,0,0,1,32-32h32a32,32,0,0,1,0,64h-32A32,32,0,0,1,96,128Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
        <line x1="160" y1="96" x2="192" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
        <line x1="96" y1="160" x2="64" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
    </svg>
);

const UsersIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A64,64,0,1,0,192,88,64.07,64.07,0,0,0,128,24Zm0,112a48,48,0,1,1,48-48A48.05,48.05,0,0,1,128,136Zm-8,72H136a8,8,0,0,1,0,16H120a8,8,0,0,1,0-16ZM224,192v-8a48,48,0,0,0-48-48H80a48,48,0,0,0-48,48v8a8,8,0,0,0,16,0v-8a32,32,0,0,1,32-32h96a32,32,0,0,1,32,32v8a8,8,0,0,0,16,0Z"></path>
    </svg>
);

const ListIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M208,72H48A8,8,0,0,1,48,56H208a8,8,0,0,1,0,16Zm0,64H48a8,8,0,0,1,0-16H208a8,8,0,0,1,0,16Zm0,64H48a8,8,0,0,1,0-16H208a8,8,0,0,1,0,16Z"></path>
    </svg>
);

const UserListIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-40-88a12,12,0,1,1,12-12A12,12,0,0,1,88,128Zm80-12a12,12,0,1,1-12,12A12,12,0,0,1,168,116ZM128,164a28,28,0,1,1,28-28A28,28,0,0,1,128,164Z"></path>
    </svg>
);


const LogOutIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-128a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V96A8,8,0,0,1,128,88Z"></path>
    </svg>
);

const CheckCircleIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32Z"></path>
    </svg>
);

const XCircleIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
    </svg>
);

const TrashIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M216,48H176V40a24,24,0,0,0-24-24H104a24,24,0,0,0-24,24v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8A8,8,0,0,0,216,48ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192Z"></path>
    </svg>
);

// CAMBIO: Nuevo icono para el botón de añadir alumno (UserPlusIcon ya existía, pero lo redefino aquí por claridad)
const AddUserIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,128a64,64,0,1,0-64-64A64,64,0,0,0,128,128ZM224,216a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8,80,80,0,0,1,160,0Zm-80-80h-16a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V152h16a8,8,0,0,0,0-16H160V120a8,8,0,0,0-16,0Z"></path>
    </svg>
);

const WifiHighIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M128,184a12,12,0,1,1,12-12A12,12,0,0,1,128,184Zm96-64a8,8,0,0,0-8-8,104,104,0,0,0-192,0,8,8,0,0,0-8,8,8,8,0,0,0,8,8,88,88,0,0,1,160,0,8,8,0,0,0,8,8,8,8,0,0,0,8-8ZM48,152a8,8,0,0,0-8-8,128,128,0,0,0,200,0,8,8,0,0,0-8,8,8,8,0,0,0,8,8,144,144,0,0,1-216,0,8,8,0,0,0,8-8Z"></path>
    </svg>
);

const WifiSlashIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M208,208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8ZM128,184a12,12,0,1,0,12,12A12,12,0,0,0,128,184Zm96-64a8,8,0,0,0-8-8,104,104,0,0,0-192,0,8,8,0,0,0-8,8,8,8,0,0,0,8,8,88,88,0,0,1,160,0,8,8,0,0,0,8,8,8,8,0,0,0,8-8ZM48,152a8,8,0,0,0-8-8,128,128,0,0,0,200,0,8,8,0,0,0-8,8,8,8,0,0,0,8,8,144,144,0,0,1-216,0,8,8,0,0,0,8-8Z"></path>
        <line x1="40" y1="40" x2="216" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
    </svg>
);

const SpinnerIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" className="opacity-25"></circle>
        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill={color} className="opacity-75"></path>
    </svg>
);

// CAMBIO: Nuevo icono para la flecha del dropdown
const ChevronDownIcon = ({ size = 20, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
        <path d="M208.49,96.49a12,12,0,0,0-17,0L128,169.41,64.49,96.49a12,12,0,0,0-17,17l71,71a12,12,0,0,0,17,0Z"></path>
    </svg>
);


function AdminDashboard() {
    const navigate = useNavigate();
    // Ensure this matches your backend's actual URL
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // CAMBIO: Puerto de backend a 3001

    const [activeSection, setActiveSection] = useState('vinculacionRobots'); 
    const [message, setMessage] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', type: '' });
    const [confirmAction, setConfirmAction] = useState(null); 

    // State for forms
    const [linkRobotCode, setLinkRobotCode] = useState('');
    const [linkRobotName, setLinkRobotName] = useState('');
    // CAMBIO: newStudentIdentifier para aceptar nombres de usuario
    const [newStudentIdentifier, setNewStudentIdentifier] = useState(''); 
    const [selectedRobotForStudent, setSelectedRobotForStudent] = useState(''); 

    // Data states
    const [robots, setRobots] = useState([]);
    const [students, setStudents] = useState([]); // Students assigned to current professor (for "Gestionar Alumnos")
    const [allStudents, setAllStudents] = useState([]); // All students in the system (for "Listado de Alumnos")
    const [professorEmail, setProfessorEmail] = useState(null); // To store the logged-in professor's email

    // Helper to get JWT token from localStorage
    const getToken = () => localStorage.getItem('token');

    // Function to show a temporary message (toast)
    const showToast = useCallback((type, text) => {
        setMessage({ type, text });
    }, []);

    // Function to show a confirmation modal
    const showConfirmationModal = useCallback((title, messageText, onConfirm) => {
        setModalContent({ title, message: messageText, type: 'confirm' });
        setConfirmAction(() => onConfirm); 
        setShowModal(true);
    }, []);

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowModal(false);
        setConfirmAction(null);
    };

    const handleCancel = () => {
        setShowModal(false);
        setConfirmAction(null);
    };

    // --- Fetch Data from Backend ---

    // Fetch current professor's email
    const fetchProfessorEmail = useCallback(async () => {
        console.log('Fetching professor email...');
        const token = getToken();
        if (!token) {
            navigate('/'); // Redirect to login if no token
            return;
        }
        try {
            const response = await axios.get(`${apiUrl}/api/quien-soy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfessorEmail(response.data.email);
            console.log('Professor email fetched:', response.data.email);
            return response.data.email; // Return email for use in loadData
        } catch (error) {
            console.error('Error fetching professor email:', error);
            showToast('error', '❌ Error al obtener información del usuario. Por favor, inicia sesión de nuevo.');
            handleLogout();
            return null;
        }
    }, [apiUrl, navigate, showToast]);


    // Fetch robots linked to the current professor and their status
    const fetchRobots = useCallback(async () => {
        console.log('Fetching robots...');
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return [];
        }
        try {
            const response = await axios.get(`${apiUrl}/api/dispositivos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const robotsData = response.data;

            // Fetch status for each robot concurrently
            const robotsWithStatus = await Promise.all(robotsData.map(async (robot) => {
                try {
                    const statusRes = await axios.get(`${apiUrl}/api/estado/${robot.codigo_vinculacion}`);
                    return {
                        id: robot.codigo_vinculacion, // Using codigo_vinculacion as ID
                        name: robot.nombre_personalizado,
                        code: robot.codigo_vinculacion,
                        status: statusRes.data.estado,
                        assignedTo: robot.email_alumno // Use email_alumno from DB
                    };
                } catch (statusError) {
                    console.error(`Error fetching status for robot ${robot.codigo_vinculacion}:`, statusError);
                    return {
                        id: robot.codigo_vinculacion,
                        name: robot.nombre_personalizado,
                        code: robot.codigo_vinculacion,
                        status: 'desconocido',
                        assignedTo: robot.email_alumno
                    };
                }
            }));
            setRobots(robotsWithStatus);
            console.log('Robots fetched:', robotsWithStatus);
            return robotsWithStatus; // Return fetched data for use in other fetches
        } catch (error) {
            console.error('Error fetching robots:', error);
            showToast('error', '❌ Error al cargar los robots vinculados.');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, navigate, showToast]);

    // Fetch students assigned to the current professor (for "Gestionar Alumnos" and "Listado de Alumnos")
    const fetchStudentsForProfessor = useCallback(async (currentProfessorEmail, fetchedRobotsData) => {
        console.log('Fetching students for current professor...');
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return [];
        }
        if (!currentProfessorEmail) { 
            setIsLoading(false);
            return [];
        }
        try {
            // Use the endpoint for students assigned to the current professor
            const response = await axios.get(`${apiUrl}/api/usuario/alumnos?email_profesor=${currentProfessorEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const studentsData = response.data;
            // Map the fetched students to match the student state structure
            const mappedStudents = studentsData.map(s => ({
                id: s.email, // El ID sigue siendo el email para consistencia con la DB
                name: s.email, // CAMBIO: Usamos el email completo como nombre para mostrar
                email: s.email,
                // Ensure fetchedRobotsData is used here, not the 'robots' state directly,
                // as 'robots' might not be updated yet in this render cycle.
                assignedRobotId: fetchedRobotsData.find(r => r.assignedTo === s.email)?.id || null 
            }));
            setStudents(mappedStudents); // Set for "Gestionar Alumnos"
            setAllStudents(mappedStudents); // Set for "Listado de Alumnos" (since both show professor's students)
            console.log('Students for professor fetched:', mappedStudents);
            return mappedStudents; // Return fetched data
        } catch (error) {
            console.error('Error fetching students:', error);
            showToast('error', '❌ Error al cargar los alumnos del profesor.');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, navigate, showToast]); 


    // --- Main Data Loading Effect ---
    useEffect(() => {
        const loadData = async () => {
            const token = getToken();
            if (!token) {
                navigate('/');
                return;
            }

            // 1. Fetch Professor Email first
            const currentProfessorEmail = await fetchProfessorEmail();
            if (!currentProfessorEmail) { // If email fetching failed or returned null
                return;
            }

            // 2. Fetch Robots
            const fetchedRobotsData = await fetchRobots();

            // 3. Fetch Students for current professor (for both "Gestionar Alumnos" and "Listado de Alumnos")
            if (currentProfessorEmail && fetchedRobotsData) {
                await fetchStudentsForProfessor(currentProfessorEmail, fetchedRobotsData);
            }
        };

        loadData();
    }, [fetchProfessorEmail, fetchRobots, fetchStudentsForProfessor, navigate]); // Dependencies for loadData


    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Filter available robots for dropdown (not assigned or assigned to a different student)
    // A robot is available if it's not assigned, or if it's currently assigned to the student being managed.
    const availableRobotsForDropdown = robots.filter(robot => 
        !robot.assignedTo || robot.assignedTo === newStudentIdentifier // CAMBIO: Usar newStudentIdentifier
    );

    // --- Handlers for Admin Actions ---

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nivel');
        navigate('/'); 
    };

    const handleLinkNewRobot = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return;
        }
        try {
            await axios.post(`${apiUrl}/api/dispositivos/vincular`, 
                { codigo: linkRobotCode, nombre: linkRobotName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('success', `✅ Robot "${linkRobotName}" (${linkRobotCode}) vinculado con éxito.`);
            setLinkRobotCode('');
            setLinkRobotName('');
            const updatedRobots = await fetchRobots(); // Refresh the list of robots
            // Pass updatedRobots to refresh students
            await fetchStudentsForProfessor(professorEmail, updatedRobots); 
        } catch (error) {
            console.error("Error linking robot:", error);
            showToast('error', '❌ Error al vincular el robot. Asegúrate de que el código sea correcto y no esté ya vinculado.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleScanNearbyRobots = async () => {
        setIsLoading(true);
        showToast('success', 'Buscando robots cercanos... (funcionalidad simulada)');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast('success', '✅ Escaneo completado. Se encontraron 2 nuevos robots (simulado).');
        } catch (error) {
            console.error("Error scanning robots:", error);
            showToast('error', '❌ Error al escanear robots. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterAndAssignStudent = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            navigate('/');
            return;
        }

        // CAMBIO: newStudentIdentifier en lugar de newStudentEmail
        if (!newStudentIdentifier || !selectedRobotForStudent) {
            showToast('error', '❌ Por favor, introduce el nombre de usuario del alumno y selecciona un robot.');
            setIsLoading(false);
            return;
        }

        try {
            // CAMBIO: Nuevo endpoint para verificar o registrar al alumno
            const checkOrRegisterRes = await axios.post(`${apiUrl}/api/admin/check-or-register-student-user`, 
                { identifier: newStudentIdentifier, professorEmail: professorEmail }, // Envía el identificador y el email del profesor logueado
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let studentEmailToAssign = newStudentIdentifier; // Por defecto, el identificador será el email si es un email
            
            if (checkOrRegisterRes.data.exists) {
                // Si el alumno ya existe, el identificador es su email real en la DB
                studentEmailToAssign = checkOrRegisterRes.data.userEmail; 
                showToast('success', `✅ Alumno "${studentEmailToAssign}" verificado.`);
            } else if (checkOrRegisterRes.data.registeredNew) {
                // Si el alumno fue registrado, el identificador es su nuevo email/username
                studentEmailToAssign = checkOrRegisterRes.data.userEmail;
                showToast('success', `✅ Alumno "${studentEmailToAssign}" registrado con éxito (sin contraseña).`);
            } else {
                // Esto no debería ocurrir si el backend funciona como se espera, pero es un fallback
                showToast('error', `❌ No se pudo verificar o registrar al alumno "${newStudentIdentifier}".`);
                setIsLoading(false);
                return;
            }

            // Si el alumno existe o fue registrado, procede a asignar/reassignar robot
            // Primero, busca el robot actualmente asignado a este alumno (si lo hay)
            const currentRobotOfStudent = robots.find(r => r.assignedTo === studentEmailToAssign);
            
            // Si el alumno está actualmente asignado a un robot DIFERENTE, desvincúlalo primero
            if (currentRobotOfStudent && currentRobotOfStudent.id !== selectedRobotForStudent) {
                await axios.put(`${apiUrl}/api/dispositivos/${currentRobotOfStudent.id}`, 
                    { nombre: currentRobotOfStudent.name, email_alumno: null }, // Desvincular robot antiguo del alumno
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Ahora, asigna el robot seleccionado al alumno
            const robotToAssign = robots.find(r => r.id === selectedRobotForStudent);
            if (robotToAssign) {
                await axios.put(`${apiUrl}/api/dispositivos/${selectedRobotForStudent}`, 
                    { nombre: robotToAssign.name, email_alumno: studentEmailToAssign }, // Asignar el robot al alumno
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showToast('success', `✅ Robot asignado a "${studentEmailToAssign}" con éxito.`);
            } else {
                showToast('error', '❌ Robot seleccionado no encontrado.');
            }
            
            setNewStudentIdentifier(''); // CAMBIO: Limpiar el identificador
            setSelectedRobotForStudent('');
            const updatedRobots = await fetchRobots(); // Refrescar la lista de robots para actualizar asignaciones
            await fetchStudentsForProfessor(professorEmail, updatedRobots); // Refrescar la lista de alumnos (para el profesor actual)
        } catch (error) {
            console.error("Error registering/assigning student:", error);
            showToast('error', '❌ Error al asignar alumno. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStudent = (studentEmailToDelete) => {
        showConfirmationModal(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar a este alumno? Esta acción es irreversible.",
            async () => {
                setIsLoading(true);
                const token = getToken();
                if (!token) {
                    setIsLoading(false);
                    navigate('/');
                    return;
                }
                try {
                    // Desasignar cualquier robot vinculado a este alumno antes de eliminar al alumno
                    const robotAssignedToStudent = robots.find(r => r.assignedTo === studentEmailToDelete);
                    if (robotAssignedToStudent) {
                        await axios.put(`${apiUrl}/api/dispositivos/${robotAssignedToStudent.id}`, 
                            { nombre: robotAssignedToStudent.name, email_alumno: null },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }

                    await axios.delete(`${apiUrl}/api/usuario/alumno/${studentEmailToDelete}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    showToast('success', `✅ Alumno eliminado con éxito.`);
                    const updatedRobots = await fetchRobots(); // Refrescar lista de robots (para actualizar estado de asignación)
                    await fetchStudentsForProfessor(professorEmail, updatedRobots); // Refrescar lista de alumnos (para el profesor actual)
                } catch (error) {
                    console.error("Error deleting student:", error);
                    showToast('error', '❌ Error al eliminar el alumno. Inténtalo de nuevo.');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const handleUnlinkRobot = (robotIdToUnlink) => {
        showConfirmationModal(
            "Confirmar Desvinculación",
            "¿Estás seguro de que quieres desvincular este robot de su alumno? Permanecerá vinculado a ti como profesor.",
            async () => {
                setIsLoading(true);
                const token = getToken();
                if (!token) {
                    setIsLoading(false);
                    navigate('/');
                    return;
                }
                try {
                    const robotToUpdate = robots.find(r => r.id === robotIdToUnlink);
                    if (robotToUpdate) {
                        await axios.put(`${apiUrl}/api/dispositivos/${robotIdToUnlink}`, 
                            { nombre: robotToUpdate.name, email_alumno: null }, // Set email_alumno to null
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        showToast('success', `✅ Robot desvinculado de su alumno con éxito.`);
                        const updatedRobots = await fetchRobots(); // Refresh robots list
                        await fetchStudentsForProfessor(professorEmail, updatedRobots); // Refresh students list (for current professor)
                    } else {
                        showToast('error', '❌ Robot no encontrado para desvincular.');
                    }
                } catch (error) {
                    console.error("Error unlinking robot:", error);
                    showToast('error', '❌ Error al desvincular el robot. Inténtalo de nuevo.');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    // --- Render Sections ---
    const renderContent = () => {
        switch (activeSection) {
            case 'vinculacionRobots':
                return (
                    <div className="content-card fade-in">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center font-comfortaa">
                            Vincular Nuevo Robot
                        </h2>
                        <form onSubmit={handleLinkNewRobot}>
                            <div className="form-group">
                                <label htmlFor="robotCode" className="form-label">Código de Vinculación</label>
                                <input
                                    type="text"
                                    id="robotCode"
                                    placeholder="Ej. 123456"
                                    value={linkRobotCode}
                                    onChange={(e) => setLinkRobotCode(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="robotName" className="form-label">Nombre del Robot</label>
                                <input
                                    type="text"
                                    id="robotName"
                                    placeholder="Ej. Avatiñ@ Explorador"
                                    value={linkRobotName}
                                    onChange={(e) => setLinkRobotName(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="action-button primary-button"
                            >
                                {isLoading ? <SpinnerIcon size={20} color="white" className="spinner" /> : <LinkIcon size={20} color="white" />}
                                {isLoading ? 'Vinculando...' : 'Vincular Robot'}
                            </button>
                        </form>
                        <div className="separator my-8">
                            <span className="separator-text">O</span>
                        </div>
                        <button
                            onClick={handleScanNearbyRobots}
                            disabled={isLoading}
                            className="action-button secondary-button"
                        >
                            {isLoading ? <SpinnerIcon size={20} color="white" className="spinner" /> : <WifiHighIcon size={20} color="white" />}
                            {isLoading ? 'Escaneando...' : 'Escanear Robots Cercanos'}
                        </button>
                    </div>
                );
            case 'gestionarAlumnos':
                return (
                    <div className="content-card fade-in">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center font-comfortaa">
                            Gestionar Alumnos
                        </h2>
                        <form onSubmit={handleRegisterAndAssignStudent}>
                            <div className="form-group">
                                {/* CAMBIO: Tipo de input a 'text' y placeholder */}
                                <label htmlFor="studentIdentifier" className="form-label">Nombre de Usuario del Alumno</label>
                                <input
                                    type="text" 
                                    id="studentIdentifier"
                                    placeholder="ej. Juanito_Perez"
                                    value={newStudentIdentifier} // CAMBIO: Usar newStudentIdentifier
                                    onChange={(e) => setNewStudentIdentifier(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="selectRobot" className="form-label">Selecciona un Robot</label>
                                <div className="relative">
                                    <select
                                        id="selectRobot"
                                        value={selectedRobotForStudent}
                                        onChange={(e) => setSelectedRobotForStudent(e.target.value)}
                                        className="form-input appearance-none pr-10" 
                                        required
                                    >
                                        <option value="" disabled>Selecciona un robot</option>
                                        {availableRobotsForDropdown.map(robot => (
                                            <option key={robot.id} value={robot.id}>
                                                {robot.name} ({robot.code}) {robot.assignedTo && robot.assignedTo !== newStudentIdentifier ? ` - Asignado a ${robot.assignedTo}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {/* CAMBIO: Nuevo icono para el dropdown */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <ChevronDownIcon size={20} /> 
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !newStudentIdentifier || !selectedRobotForStudent} // CAMBIO: Usar newStudentIdentifier
                                className="action-button primary-button"
                            >
                                {isLoading ? <SpinnerIcon size={20} color="white" className="spinner" /> : <AddUserIcon size={20} color="white" />} {/* CAMBIO: Icono AddUserIcon */}
                                {isLoading ? 'Asignando...' : 'Añadir Alumno'} {/* CAMBIO: Texto del botón */}
                            </button>
                        </form>

                        <div className="separator my-8">
                            <span className="separator-text">Tus Alumnos Registrados</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* CAMBIO: Aumentado el gap a gap-6 */}
                            {students.length > 0 ? (
                                students.map(student => (
                                    <div key={student.id} className="student-card">
                                        <h3 className="font-semibold text-lg text-gray-800">{student.name}</h3> {/* CAMBIO: name ahora es el identificador completo */}
                                        <p className="text-sm text-gray-600">{student.email}</p>
                                        <p className="text-sm text-gray-600">
                                            {student.assignedRobotId ? (
                                                `Robot asignado: ${robots.find(r => r.id === student.assignedRobotId)?.name || 'Desconocido'}`
                                            ) : (
                                                'Sin robot asignado'
                                            )}
                                        </p>
                                        <button
                                            onClick={() => handleDeleteStudent(student.email)} 
                                            disabled={isLoading}
                                            className="delete-button"
                                        >
                                            <TrashIcon size={16} /> Eliminar
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 col-span-full">No hay alumnos registrados aún.</p>
                            )}
                        </div>
                    </div>
                );
            case 'robotsVinculados':
                return (
                    <div className="content-card fade-in">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center font-comfortaa">
                            Robots Vinculados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {robots.length > 0 ? (
                                robots.map(robot => (
                                    <div key={robot.id} className="robot-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg text-gray-800">{robot.name}</h3>
                                            <span className={`status-indicator ${robot.status === 'connected' ? 'bg-green-500' : robot.status === 'disconnected' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                        </div>
                                        <p className="text-sm text-gray-600">Código: {robot.code}</p>
                                        <p className="text-sm text-gray-600">Estado: {robot.status === 'connected' ? 'Conectado' : robot.status === 'disconnected' ? 'Desconectado' : 'Desconocido'}</p>
                                        <p className="text-sm text-gray-600">
                                            {robot.assignedTo ? `Asignado a: ${robot.assignedTo}` : 'No asignado'} {/* CAMBIO: Mostrar el identificador completo */}
                                        </p>
                                        {/* No camarita icon here */}
                                        <button
                                            onClick={() => handleUnlinkRobot(robot.id)}
                                            disabled={isLoading}
                                            className="unlink-button"
                                        >
                                            <LinkIcon size={16} className="rotate-45" /> Desvincular de alumno
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 col-span-full">No hay robots vinculados aún.</p>
                            )}
                        </div>
                    </div>
                );
            case 'listadoAlumnos': // This section now also shows only the current professor's students
                return (
                    <div className="content-card fade-in">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center font-comfortaa">
                            Listado de Alumnos (a tu cargo)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* CAMBIO: Aumentado el gap a gap-6 */}
                            {allStudents.length > 0 ? ( // 'allStudents' now holds the same data as 'students'
                                allStudents.map(student => (
                                    <div key={student.id} className="student-card">
                                        <h3 className="font-semibold text-lg text-gray-800">{student.name}</h3> {/* CAMBIO: name ahora es el identificador completo */}
                                        <p className="text-sm text-gray-600">{student.email}</p>
                                        <p className="text-sm text-gray-600">
                                            {student.assignedRobotId ? (
                                                `Robot asignado: ${robots.find(r => r.id === student.assignedRobotId)?.name || 'Desconocido'}`
                                            ) : (
                                                'Sin robot asignado'
                                            )}
                                        </p>
                                        {/* Optional: Add delete button here if admin level 1 can delete any student */}
                                        {/* <button
                                            onClick={() => handleDeleteStudent(student.email)} 
                                            disabled={isLoading}
                                            className="delete-button"
                                        >
                                            <TrashIcon size={16} /> Eliminar
                                        </button> */}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 col-span-full">No hay alumnos registrados a tu cargo.</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Tailwind CSS CDN (for utility classes) */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Custom Styles for Glassmorphism and specific elements */}
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
                    --color-success: #4CAF50; /* Success green */
                    --color-error: #F44336; /* Error red */
                    --color-sidebar-bg: rgba(255, 255, 255, 0.85); /* Slightly less opaque white for sidebar */
                    --color-sidebar-border: rgba(255, 255, 255, 0.6);
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

                .font-comfortaa {
                    font-family: 'Comfortaa', cursive;
                }

                .admin-container {
                    min-height: 100vh;
                    display: flex;
                    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-purple) 50%, var(--color-secondary-light) 100%);
                    animation: backgroundShift 15s ease infinite alternate;
                    position: relative;
                    overflow: hidden;
                }

                @keyframes backgroundShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Sidebar Styles */
                .sidebar {
                    width: 280px;
                    background: var(--color-sidebar-bg);
                    border-right: 1px solid var(--color-sidebar-border);
                    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    position: relative;
                    z-index: 20;
                    /* Ensure it takes full height and allows logout button to stick to bottom */
                    height: 100vh; 
                    position: sticky; /* Make it sticky */
                    top: 0; /* Stick to the top */
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 40px;
                    padding: 10px;
                    border-bottom: 1px solid rgba(150, 150, 150, 0.1);
                    padding-bottom: 20px;
                }

                .sidebar-logo {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background-color: rgba(127, 192, 240, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .sidebar-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .sidebar-title {
                    font-family: 'Comfortaa', cursive;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--color-text-dark);
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
                }

                .sidebar-nav {
                    flex-grow: 1; /* Allow navigation items to take available space */
                    margin-bottom: 30px; /* Pushes logout button up */
                }

                .sidebar-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 15px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--color-text-dark);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
                }

                .sidebar-nav-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    background: rgba(255, 255, 255, 0.6);
                }

                .sidebar-nav-item.active {
                    background: linear-gradient(45deg, var(--color-primary-medium) 0%, var(--color-accent-green) 100%);
                    color: var(--color-text-light);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
                    transform: translateY(-1px);
                }
                .sidebar-nav-item.active svg {
                    color: var(--color-text-light);
                }

                .sidebar-logout-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 15px 20px;
                    background: linear-gradient(45deg, #FF6B6B 0%, #FF8E8E 100%); /* Soft red gradient */
                    color: var(--color-text-light);
                    font-weight: 700;
                    font-size: 1.1rem;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    margin-top: auto; /* CAMBIO: Empuja el botón al final */
                    flex-shrink: 0; /* CAMBIO: Evita que el botón se encoja */
                }
                .sidebar-logout-button:hover {
                    background: linear-gradient(45deg, #FF8E8E 0%, #FF6B6B 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
                }
                .sidebar-logout-button:active {
                    transform: translateY(0);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }


                /* Main Content Area */
                .main-content {
                    flex-grow: 1;
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start; /* Align content to top within main area */
                    overflow-y: auto; /* Enable scrolling for content if it overflows */
                }

                .content-card {
                    background: var(--color-form-bg);
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    width: 100%;
                    max-width: 700px; /* Wider card for content */
                    transform: translateY(0);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    z-index: 10;
                }
                .content-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                /* Form Elements */
                .form-group {
                    margin-bottom: 25px;
                }
                .form-label {
                    display: block;
                    font-weight: 600;
                    color: var(--color-text-dark);
                    margin-bottom: 8px;
                    font-size: 1rem;
                }
                .form-input {
                    width: 100%;
                    padding: 15px 20px;
                    border-radius: 15px;
                    border: 2px solid var(--color-border);
                    font-size: 1.1rem;
                    color: var(--color-text-dark);
                    outline: none;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    background-color: rgba(255, 255, 255, 0.7);
                }
                .form-input::placeholder {
                    color: var(--color-text-dark);
                    opacity: 0.5;
                }
                .form-input:focus {
                    border-color: var(--color-primary-medium);
                    box-shadow: 0 0 0 4px rgba(127, 192, 240, 0.3);
                }

                /* Buttons */
                .action-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 15px 20px;
                    font-weight: 700;
                    font-size: 1.2rem;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                .primary-button {
                    background: linear-gradient(45deg, var(--color-accent-green) 0%, var(--color-primary-medium) 100%);
                    color: var(--color-text-light);
                }
                .primary-button:hover:not(:disabled) {
                    background: linear-gradient(45deg, var(--color-primary-medium) 0%, var(--color-accent-green) 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                }
                .secondary-button {
                    background: linear-gradient(45deg, var(--color-accent-purple) 0%, var(--color-secondary-medium) 100%);
                    color: var(--color-text-light);
                }
                .secondary-button:hover:not(:disabled) {
                    background: linear-gradient(45deg, var(--color-secondary-medium) 0%, var(--color-accent-purple) 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                }
                .action-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Spinner */
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Separator */
                .separator {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .separator::before, .separator::after {
                    content: '';
                    flex-grow: 1;
                    height: 2px;
                    background-color: var(--color-border);
                    border-radius: 1px;
                }
                .separator-text {
                    flex-shrink: 0;
                    margin: 0 15px;
                    color: var(--color-text-dark);
                    font-weight: 500;
                    font-size: 1rem;
                    background-color: var(--color-form-bg);
                    padding: 0 10px;
                    border-radius: 5px;
                }

                /* Toast Messages */
                .toast-message {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-weight: 600;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    z-index: 100;
                    animation: fadeInOut 5s forwards;
                }
                .toast-message.success {
                    background-color: rgba(76, 175, 80, 0.9); /* Green */
                    color: white;
                }
                .toast-message.error {
                    background-color: rgba(244, 67, 54, 0.9); /* Red */
                    color: white;
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                }

                /* Confirmation Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: var(--color-form-bg);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    width: 90%;
                    max-width: 400px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.7);
                }
                .modal-title {
                    font-family: 'Comfortaa', cursive;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--color-text-dark);
                    margin-bottom: 15px;
                }
                .modal-message {
                    font-size: 1rem;
                    color: var(--color-text-dark);
                    margin-bottom: 30px;
                }
                .modal-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                .modal-button {
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .modal-button.confirm {
                    background-color: #FF6B6B; /* Red for confirm */
                    color: white;
                }
                .modal-button.confirm:hover {
                    background-color: #FF8E8E;
                }
                .modal-button.cancel {
                    background-color: #E0E0E0; /* Light gray for cancel */
                    color: var(--color-text-dark);
                }
                .modal-button.cancel:hover {
                    background-color: #D0D0D0;
                }

                /* Card styles for lists */
                .student-card, .robot-card {
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .student-card:hover, .robot-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
                }
                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-left: 8px;
                }
                .delete-button, .unlink-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    padding: 8px 12px;
                    margin-top: 15px;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                }
                .delete-button {
                    background-color: #FFCCCC; /* Light red */
                    color: #D32F2F; /* Darker red text */
                }
                .delete-button:hover:not(:disabled) {
                    background-color: #FFB3B3;
                    transform: translateY(-1px);
                }
                .unlink-button {
                    background-color: #D1E7DD; /* Light green-blue */
                    color: #28A745; /* Darker green text */
                }
                .unlink-button:hover:not(:disabled) {
                    background-color: #B8E0C9;
                    transform: translateY(-1px);
                }
                .delete-button:disabled, .unlink-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .admin-container {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        height: auto;
                        border-right: none;
                        border-bottom: 1px solid var(--color-sidebar-border);
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                        position: relative; /* Remove sticky on mobile */
                    }
                    .sidebar-nav {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 10px;
                    }
                    .sidebar-nav-item {
                        flex-grow: 1;
                        text-align: center;
                        justify-content: center;
                        padding: 10px 15px;
                        font-size: 1rem;
                    }
                    .sidebar-logout-button {
                        margin-top: 20px;
                        width: auto;
                    }
                    .main-content {
                        padding: 20px;
                    }
                    .content-card {
                        padding: 25px;
                    }
                    .app-title, .welcome-text {
                        font-size: 1.5rem;
                    }
                }
                `}
            </style>

            <div className="admin-container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-logo">
                            <img 
                                src={cesgaLogo} 
                                alt="Robot Avatiñ@ Logo" 
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/7FC0F0/FFFFFF?text=R'; }}
                            />
                        </div>
                        <h1 className="sidebar-title">Robot Avatiñ@</h1>
                    </div>
                    <nav className="sidebar-nav">
                        <button
                            className={`sidebar-nav-item ${activeSection === 'vinculacionRobots' ? 'active' : ''}`}
                            onClick={() => setActiveSection('vinculacionRobots')}
                        >
                            <RobotIcon size={24} />
                            Vinculación de Robots
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeSection === 'gestionarAlumnos' ? 'active' : ''}`}
                            onClick={() => setActiveSection('gestionarAlumnos')}
                        >
                            <UsersIcon size={24} />
                            Gestionar Alumnos
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeSection === 'robotsVinculados' ? 'active' : ''}`}
                            onClick={() => setActiveSection('robotsVinculados')}
                        >
                            <ListIcon size={24} />
                            Robots Vinculados
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeSection === 'listadoAlumnos' ? 'active' : ''}`}
                            onClick={() => setActiveSection('listadoAlumnos')}
                        >
                            <UserListIcon size={24} />
                            Listado de Alumnos
                        </button>
                    </nav>
                    <button
                        className="sidebar-logout-button"
                        onClick={handleLogout}
                    >
                        <LogOutIcon size={24} />
                        Cerrar Sesión
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="main-content">
                    {renderContent()}
                </main>

                {/* Toast Message */}
                {message && (
                    <div className={`toast-message ${message.type}`}>
                        {message.type === 'success' ? <CheckCircleIcon size={20} color="white" /> : <XCircleIcon size={20} color="white" />}
                        {message.text}
                    </div>
                )}

                {/* Confirmation Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3 className="modal-title">{modalContent.title}</h3>
                            <p className="modal-message">{modalContent.message}</p>
                            <div className="modal-buttons">
                                <button className="modal-button cancel" onClick={handleCancel}>
                                    Cancelar
                                </button>
                                <button className="modal-button confirm" onClick={handleConfirm}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminDashboard;
