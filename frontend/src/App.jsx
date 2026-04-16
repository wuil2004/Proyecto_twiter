import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Muro from './pages/Muro'; 

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Muro />} />
          <Route path="/login" element={<Login />} />
          {/* ¡Eliminamos la ruta de /register porque ahora todo vive en /login! */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;