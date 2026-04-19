import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './Auth.css';

function Login() {

    const [viewState, setViewState] = useState('split');
    
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Desplegando nuevo usuario...');
        try {
            await axios.post('http://localhost:8080/api/users/', { username, email, password });
            const respuesta = await axios.post('http://localhost:8080/api/users/login', { email, password });
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('username', respuesta.data.usuario.username);
            toast.success('¡Registro y conexión exitosos!', { id: toastId });
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error en el registro.', { id: toastId });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Verificando acceso...');
        try {
            const respuesta = await axios.post('http://localhost:8080/api/users/login', { email, password });
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('username', respuesta.data.usuario.username);
            toast.success('¡Conexión establecida!', { id: toastId });
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Credenciales rechazadas.', { id: toastId });
        }
    };

    
    const handleBack = (e) => {
        e.stopPropagation(); 
        setViewState('split');
        setPassword('');
    };

    // Íconos SVG
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    );
    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
    );

    return (
        
        <div className={`split-wrapper view-${viewState}`}>
            <Toaster position="top-center" toastOptions={{ style: { background: '#121212', color: '#0ef', border: '1px solid #0ef' }}} />

            { /*  */ }
            <div className="panel panel-login" onClick={() => viewState === 'split' && setViewState('login')}>
                
                {/*   */}
                <button className="btn-back" onClick={handleBack}>
                    ← Volver
                </button>

            
                <div className="hero-content">
                    <h1>Iniciar Sesión</h1>
                    <p>Bienvenido de vuelta</p>
                </div>

            
                <div className="form-content">
                    <h2>Acceso al Sistema</h2>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label>Correo Electrónico</label>
                        </div>
                        <div className="input-group">
                            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label>Contraseña</label>
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <button type="submit" className="btn-submit">Entrar</button>
                    </form>
                </div>
            </div>

            
            <div className="panel panel-register" onClick={() => viewState === 'split' && setViewState('register')}>
                
                
                <button className="btn-back" onClick={handleBack}>
                    ← Volver
                </button>

                
                <div className="hero-content">
                    <h1>Registrarse</h1>
                    <p>Bienvenido a una nueva experiencia</p>
                </div>

                {/* Formulario */}
                <div className="form-content">
                    <h2>Nuevo Nodo de Usuario</h2>
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
                            <label>Nombre de Usuario</label>
                        </div>
                        <div className="input-group">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label>Correo Electrónico</label>
                        </div>
                        <div className="input-group">
                            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label>Contraseña</label>
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <button type="submit" className="btn-submit" style={{ borderColor: '#0ef', color: '#0ef' }}>
                            Crear Cuenta
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
}

export default Login;