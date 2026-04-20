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

    const [usuarioActual, setUsuarioActual] = useState('Usuario');
    
    const [archivo, setArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);

    // 👇 1. NUEVO ESTADO PARA SABER SI ESTAMOS EN "MI PERFIL" 👇
    const [verMiPerfil, setVerMiPerfil] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        cargarMuro();

        const usernameGuardado = localStorage.getItem('username') || 'Invitado';
        setUsuarioActual(usernameGuardado);

        const intervalo = setInterval(() => {
            cargarMuro();
        }, 5000);

        return () => clearInterval(intervalo);
    }, []);

    const cargarMuro = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const respuesta = await axios.get('http://localhost:8080/api/posts/', { headers: { Authorization: `Bearer ${token}` } });
            setTuits(respuesta.data.muro || []); 
        } catch (err) {
            setError('Error al cargar el muro.');
            if (err.response?.status === 401) cerrarSesion();
        }
    };

    const publicarTuit = async (e) => {
        e.preventDefault();
        if (!nuevoTuit.trim()) return;
        
        const token = localStorage.getItem('token');
        setSubiendo(true); 
        let urlDeImagen = null;

        try {
            if (archivo) {
                const formData = new FormData();
                formData.append('file', archivo); 

                const respuestaMedia = await axios.post('http://localhost:8080/api/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                urlDeImagen = respuestaMedia.data.url; 
            }

            await axios.post('http://localhost:8080/api/posts/', { 
                texto: nuevoTuit,
                imagenUrl: urlDeImagen 
            }, { headers: { Authorization: `Bearer ${token}` } });

            setNuevoTuit('');
            setArchivo(null);
            document.getElementById('fileInput').value = ''; 
            busquedaActiva ? limpiarBusqueda() : cargarMuro();
            
            // Si estaba en "Mi Perfil", lo regreso al muro global para que vea su nuevo post
            if (verMiPerfil) setVerMiPerfil(false); 
            
        } catch (err) {
            alert("Hubo un error al publicar el tuit o la imagen.");
            console.error(err);
        } finally {
            setSubiendo(false); 
        }
    };

    const darLike = async (postId) => {
        const token = localStorage.getItem('token');
        try {
            const respuesta = await axios.post(`http://localhost:8080/api/likes/${postId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setTuits((tuitsAnteriores) =>
                tuitsAnteriores.map((tuit) => tuit._id === postId ? { ...tuit, likes: respuesta.data.totalLikes } : tuit)
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
            setTuits(respuesta.data.resultados || []);
            setBusquedaActiva(true);
            setVerMiPerfil(false); // Si busca algo, quitamos la vista de "Mi Perfil"
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
        localStorage.removeItem('username');
        navigate('/login');
    };

    const obtenerTiempoRelativo = (fecha) => {
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

    // 👇 2. FILTRAMOS LOS TUITS SI EL MODO "MI PERFIL" ESTÁ ACTIVO 👇
    const tuitsAMostrar = verMiPerfil 
        ? tuits.filter(tuit => tuit.autorId?.username === usuarioActual)
        : tuits;

    return (
        <div className="muro-wrapper">
            <div className="muro-dashboard">

                <aside className="muro-sidebar">
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
                        
                        {/* 👇 3. BOTONES PARA CAMBIAR ENTRE MURO Y PERFIL 👇 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <button 
                                onClick={() => {
                                    setVerMiPerfil(!verMiPerfil);
                                    if (busquedaActiva) limpiarBusqueda();
                                }} 
                                className="btn-neon btn-neon-auto"
                            >
                                {verMiPerfil ? '🌐 Ver Transmisiones Globales' : '👤 Ver Mis Transmisiones'}
                            </button>
                            <button onClick={cerrarSesion} className="btn-neon btn-neon-red">
                                Desconectar Nodo
                            </button>
                        </div>
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

                <main className="muro-feed">
                    {error && <p style={{ color: '#ff2a5f', textAlign: 'center', background: 'rgba(255,42,95,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</p>}

                    {/* 👇 4. TÍTULO DINÁMICO 👇 */}
                    <h2 className="panel-title" style={{ paddingLeft: '10px' }}>
                        {busquedaActiva 
                            ? 'Resultados de Búsqueda' 
                            : (verMiPerfil ? 'Mis Transmisiones' : 'Transmisiones Globales')}
                    </h2>

                    {!busquedaActiva && !verMiPerfil && (
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input 
                                                    type="file" 
                                                    id="fileInput"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => setArchivo(e.target.files[0])}
                                                />
                                                <label htmlFor="fileInput" style={{ cursor: 'pointer', fontSize: '20px' }} title="Subir imagen">
                                                    📸
                                                </label>
                                                {archivo && <span style={{ fontSize: '12px', color: '#a0aec0' }}>{archivo.name}</span>}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ color: nuevoTuit.length === 280 ? '#ff2a5f' : '#8892b0', fontSize: '13px', fontWeight: 'bold' }}>
                                                    {nuevoTuit.length} / 280
                                                </span>
                                                <button type="submit" disabled={!nuevoTuit.trim() || subiendo} className="btn-neon btn-neon-auto">
                                                    {subiendo ? 'Subiendo...' : 'Transmitir'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="tuits-list">
                        {/* 👇 5. USAMOS tuitsAMostrar EN LUGAR DE tuits 👇 */}
                        {tuitsAMostrar?.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', color: '#8892b0', padding: '40px' }}>
                                {busquedaActiva 
                                    ? 'Búsqueda sin resultados. 🕵️‍♂️' 
                                    : (verMiPerfil ? 'Aún no has transmitido ningún dato.' : 'No hay transmisiones. Inicia la primera conexión.')}
                            </div>
                        ) : (
                            tuitsAMostrar?.map((tuit) => (
                                <div key={tuit._id} className="glass-panel tuit-card">
                                    <div className="tuit-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                    
                                    {tuit.imagenUrl && (
                                        <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden' }}>
                                            <img 
                                                src={tuit.imagenUrl} 
                                                alt="Imagen adjunta" 
                                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    )}

                                    <button onClick={() => darLike(tuit._id)} className="btn-like" style={{ marginTop: '15px' }}>
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