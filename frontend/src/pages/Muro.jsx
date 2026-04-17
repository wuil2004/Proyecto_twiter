import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Muro() {
    const [tuits, setTuits] = useState([]);
    const [nuevoTuit, setNuevoTuit] = useState('');

    // 👇 NUEVOS ESTADOS PARA EL BUSCADOR 👇
    const [busqueda, setBusqueda] = useState('');
    const [busquedaActiva, setBusquedaActiva] = useState(false);

    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        cargarMuro();
    }, []);

    const cargarMuro = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const respuesta = await axios.get('http://localhost:8080/api/posts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            await axios.post('http://localhost:8080/api/posts/',
                { texto: nuevoTuit },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNuevoTuit('');

            if (busquedaActiva) {
                limpiarBusqueda();
            } else {
                cargarMuro();
            }
        } catch (err) {
            alert("Hubo un error al publicar el tuit.");
        }
    };

    const darLike = async (postId) => {
        const token = localStorage.getItem('token');
        try {
            const respuesta = await axios.post(`http://localhost:8080/api/likes/${postId}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTuits((tuitsAnteriores) =>
                tuitsAnteriores.map((tuit) =>
                    tuit._id === postId
                        ? { ...tuit, likes: respuesta.data.totalLikes }
                        : tuit
                )
            );
        } catch (err) {
            console.error("Error al dar like", err);
        }
    };


    const buscarTuits = async (e) => {
        e.preventDefault();
        if (!busqueda.trim()) {
            limpiarBusqueda();
            return;
        }

        const token = localStorage.getItem('token');
        try {
        
            const respuesta = await axios.get(`http://localhost:8080/api/buscar/?q=${busqueda}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
        localStorage.removeItem('username');
        navigate('/login');
    };

    // Función para calcular el tiempo relativo
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

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '30px' }}>

        
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: 0, color: '#1da1f2' }}>{busquedaActiva ? 'Resultados de Búsqueda' : 'Inicio'}</h2>
                <button onClick={cerrarSesion} style={{ background: '#e0245e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Salir
                </button>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        
            <div style={{ marginBottom: '20px' }}>
                <form onSubmit={buscarTuits} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Buscar tuits o @usuarios..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ccd6dd', outline: 'none', fontSize: '15px' }}
                    />
                    <button type="submit" style={{ background: '#1da1f2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🔍 Buscar
                    </button>

                    {busquedaActiva && (
                        <button type="button" onClick={limpiarBusqueda} style={{ background: '#657786', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>
                            ✖ Limpiar
                        </button>
                    )}
                </form>
            </div>

        
            {!busquedaActiva && (
                <div style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={publicarTuit}>
                        <textarea
                            value={nuevoTuit}
                            onChange={(e) => setNuevoTuit(e.target.value)}
                            placeholder="¿Qué está pasando?"
                            maxLength={280}
                            style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '10px', border: '1px solid #ccd6dd', resize: 'none', fontSize: '16px', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ color: nuevoTuit.length === 280 ? 'red' : '#657786', fontSize: '14px' }}>
                                {nuevoTuit.length} / 280
                            </span>
                            <button type="submit" disabled={!nuevoTuit.trim()} style={{ background: nuevoTuit.trim() ? '#1da1f2' : '#8ed0f9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: nuevoTuit.trim() ? 'pointer' : 'default' }}>
                                Tuitear
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de tuits */}
            <div>
                {tuits.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#657786', marginTop: '40px' }}>
                        {busquedaActiva ? 'No se encontraron resultados para tu búsqueda. 🕵️‍♂️' : 'No hay tuits todavía. ¡Sé el primero en publicar!'}
                    </p>
                ) : (
                    tuits.map((tuit) => (
                        <div key={tuit._id} style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                @{tuit.autorId?.username || 'Usuario Desconocido'}
                                <span style={{ fontWeight: 'normal', color: '#657786', fontSize: '12px', marginLeft: '10px' }}>
                                    {obtenerTiempoRelativo(tuit.fechaCreacion)}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '16px', wordWrap: 'break-word' }}>{tuit.texto}</p>

                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
                                <button
                                    onClick={() => darLike(tuit._id)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #e0245e',
                                        color: '#e0245e',
                                        padding: '5px 15px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        transition: '0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#ffebee'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    ❤️ {tuit.likes}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Muro;