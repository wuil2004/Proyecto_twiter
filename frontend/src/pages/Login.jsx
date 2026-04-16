import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // ¡Librería de notificaciones premium!
import './Auth.css';

function Login() {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Ya no necesitamos el estado 'error', el Toast se encarga de todo.
    const navigate = useNavigate();

    // Función para manejar el REGISTRO Y AUTO-LOGIN
    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Ponemos un toast de carga para que el usuario sepa que algo pasa
        const toastId = toast.loading('Creando tu cuenta...');

        try {
            // 1. Creamos la cuenta
            await axios.post('http://localhost:8080/api/users/', { username, email, password });
            
            // 2. Hacemos auto-login
            const respuesta = await axios.post('http://localhost:8080/api/users/login', { email, password });
            localStorage.setItem('token', respuesta.data.token);
            
            // 3. Cambiamos el toast de "Cargando" a "¡Éxito!"
            toast.success('¡Cuenta creada y sesión iniciada!', { id: toastId });
            
            // Le damos 1 segundo de retraso antes de saltar al muro para que el usuario pueda leer el mensaje
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al registrar la cuenta.', { id: toastId });
        }
    };

    // Función para manejar el LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Verificando credenciales...');

        try {
            const respuesta = await axios.post('http://localhost:8080/api/users/login', { email, password });
            localStorage.setItem('token', respuesta.data.token);
            
            toast.success('¡Bienvenido de vuelta!', { id: toastId });
            
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            toast.error(err.response?.data?.error || 'Credenciales incorrectas.', { id: toastId });
        }
    };

    return (
        <div className="auth-wrapper">
            {/* 👇 Este componente Toaster es el que hace volar las notificaciones 👇 */}
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #0ef'
                    }
                }} 
            />

            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>

                {/* LADO IZQUIERDO: Formulario de Registro */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegister}>
                        <h1>Crear Cuenta</h1>
                        <span>Usa tu correo electrónico para registrarte</span>
                        
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <button type="submit" style={{ marginTop: '15px' }}>Registrarse</button>
                    </form>
                </div>

                {/* LADO DERECHO: Formulario de Login */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin}>
                        <h1>Iniciar Sesión</h1>
                        <span>Ingresa tus credenciales</span>
                        
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <button type="submit" style={{ marginTop: '20px' }}>Entrar</button>
                    </form>
                </div>

                {/* LA TAPA DESLIZANTE */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 style={{ color: '#121212' }}>¡Bienvenido de vuelta!</h1>
                            <p style={{ color: '#333' }}>Para mantenerte conectado, inicia sesión con tu información personal.</p>
                            <button className="ghost" onClick={() => setIsRightPanelActive(false)}>
                                Iniciar Sesión
                            </button>
                        </div>

                        <div className="overlay-panel overlay-right">
                            <h1 style={{ color: '#121212' }}>¡Hola, Amigo!</h1>
                            <p style={{ color: '#333' }}>Ingresa tus datos personales y comienza tu viaje con nosotros.</p>
                            <button className="ghost" onClick={() => setIsRightPanelActive(true)}>
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;