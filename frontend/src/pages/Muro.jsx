import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Muro.css'; 

function Muro() {
    const [tuits, setTuits] = useState([]);
    const [nuevoTuit, setNuevoTuit] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [busquedaActiva, setBusquedaActiva] = useState(false);
    const [error, setError] = useState('');
    
    // 👇 NUEVO ESTADO PARA EL USUARIO 👇
    const [usuarioActual, setUsuarioActual] = useState('Usuario');
    
    const navigate = useNavigate();

    useEffect(() => { 
        cargarMuro(); 
        
        // Al cargar la página, leemos el nombre de usuario del LocalStorage
        const usernameGuardado = localStorage.getItem('username') || 'Invitado';
        setUsuarioActual(usernameGuardado);
    }, []);

    const cargarMuro = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const respuesta = await axios.get('http://localhost:8080/api/posts/', { headers: { Authorization: `Bearer ${token}` } });
            setTuits(respuesta.data.muro);
        } catch (err) {
            setError('Error al cargar el muro.');
            if (err.response?.status === 401) cerrarSesion();
        }
    };

    const publicarTuit = async (e) => {
        e.preventDefault();
        if (!nuevoTuit.trim()) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/api/posts/', { texto: nuevoTuit }, { headers: { Authorization: `Bearer ${token}` } });
            setNuevoTuit('');
            busquedaActiva ? limpiarBusqueda() : cargarMuro();
        } catch (err) {
            alert("Hubo un error al publicar el tuit.");
        }
    };

    const darLike = async (postId) => {
        const token = localStorage.getItem('token');
        try {
            const respuesta = await axios.post(`http://localhost:8080/api/likes/${postId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setTuits((tuitsAnteriores) =>
                tuitsAnteriores.map((tuit) => tuit._id === postId ? { ...tuit, likes: respuesta.data.totalLikes } : tuit )
            );
        } catch (err) {
            console.error("Error al dar like", err);
        }
    };

    const buscarTuits = async (e) => {
        e.preventDefault();
        if (!busqueda.trim()) { limpiarBusqueda(); return; }
        const token = localStorage.getItem('token');
        try {
            const respuesta = await axios.get(`http://localhost:8080/api/buscar/?q=${busqueda}`, { headers: { Authorization: `Bearer ${token}` } });
            setTuits(respuesta.data.resultados);
            setBusquedaActiva(true);
            setError('');
        } catch (err) {
            setError('No se pudo realizar la búsqueda.');
        }
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
        setBusquedaActiva(false);
        setError('');
        cargarMuro();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username'); // Limpiamos también el usuario
        navigate('/login');
    };

    const obtenerTiempoRelativo = (fecha) => {
        // ... (Tu función de tiempo intacta)
        const ahora = new Date();
        const tiempoTuit = new Date(fecha);
        const diferenciaSegundos = Math.floor((ahora - tiempoTuit) / 1000);
        if (diferenciaSegundos < 60) return `hace ${diferenciaSegundos} seg`;
        const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
        if (diferenciaMinutos < 60) return `hace ${diferenciaMinutos} min`;
        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24) return `hace ${diferenciaHoras} h`;
        const diferenciaDias = Math.floor(diferenciaHoras / 24);
        if (diferenciaDias < 7) return `hace ${diferenciaDias} d`;
        return tiempoTuit.toLocaleDateString();
    };

    return (
        <div className="muro-wrapper">
            <div className="muro-dashboard">

                {/* COLUMNA IZQUIERDA */}
                <aside className="muro-sidebar">
                    
                    {/* 👇 TARJETA DE PERFIL ACTUALIZADA 👇 */}
                    <div className="glass-panel">
                        <div className="profile-header">
                            <img 
                                src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${usuarioActual}`} 
                                alt="Avatar" 
                                className="avatar-large" 
                            />
                            <div className="profile-info">
                                <h2>¡Hola, @{usuarioActual}!</h2>
                                <p>Estado: En línea 🟢</p>
                            </div>
                        </div>
                        <button onClick={cerrarSesion} className="btn-neon btn-neon-red">
                            Desconectar Nodo
                        </button>
                    </div>

                    <div className="glass-panel">
                        <h2 className="panel-title">Rastreador</h2>
                        <form onSubmit={buscarTuits}>
                            <input
                                type="text"
                                placeholder="Buscar @nodos o datos..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="muro-input"
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-neon">Buscar</button>
                                {busquedaActiva && (
                                    <button type="button" onClick={limpiarBusqueda} className="btn-neon btn-neon-gray">X</button>
                                )}
                            </div>
                        </form>
                    </div>
                </aside>

                {/* COLUMNA DERECHA */}
                <main className="muro-feed">
                    {error && <p style={{ color: '#ff2a5f', textAlign: 'center', background: 'rgba(255,42,95,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</p>}

                    <h2 className="panel-title" style={{ paddingLeft: '10px' }}>
                        {busquedaActiva ? 'Resultados de Búsqueda' : 'Transmisiones Globales'}
                    </h2>

                    {/* 👇 CAJA DE PUBLICAR CON AVATAR 👇 */}
                    {!busquedaActiva && (
                        <div className="glass-panel" style={{ marginBottom: '30px' }}>
                            <div className="publish-area">
                                <img 
                                    src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${usuarioActual}`} 
                                    alt="Avatar" 
                                    className="avatar-small" 
                                />
                                <div className="publish-form-wrapper">
                                    <form onSubmit={publicarTuit}>
                                        <textarea
                                            value={nuevoTuit}
                                            onChange={(e) => setNuevoTuit(e.target.value)}
                                            placeholder="¿Qué datos vas a transmitir hoy?"
                                            maxLength={280}
                                            className="muro-input"
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <span style={{ color: nuevoTuit.length === 280 ? '#ff2a5f' : '#8892b0', fontSize: '13px', fontWeight: 'bold' }}>
                                                {nuevoTuit.length} / 280
                                            </span>
                                            <button type="submit" disabled={!nuevoTuit.trim()} className="btn-neon btn-neon-auto">
                                                Transmitir
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de tuits */}
                    <div className="tuits-list">
                        {tuits.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', color: '#8892b0', padding: '40px' }}>
                                {busquedaActiva ? 'Búsqueda sin resultados. 🕵️‍♂️' : 'No hay transmisiones. Inicia la primera conexión.'}
                            </div>
                        ) : (
                            tuits.map((tuit) => (
                                <div key={tuit._id} className="glass-panel tuit-card">
                                    <div className="tuit-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {/* Avatar del autor del tuit */}
                                            <img 
                                                src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${tuit.autorId?.username || 'default'}`} 
                                                alt="Avatar" 
                                                style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
                                            />
                                            <span>@{tuit.autorId?.username || 'Nodo_Desconocido'}</span>
                                        </div>
                                        <span className="tuit-time">{obtenerTiempoRelativo(tuit.fechaCreacion)}</span>
                                    </div>
                                    <p className="tuit-text">{tuit.texto}</p>
                                    <button onClick={() => darLike(tuit._id)} className="btn-like">
                                        ❤️ {tuit.likes}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </main>

            </div>
        </div>
    );
}

export default Muro;