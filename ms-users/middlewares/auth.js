const jwt = require('jsonwebtoken');
//require('dotenv').config();

const verificarToken = (req, res, next) => {

  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ error: "Acceso denegado. No presentaste tu token VIP." });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Formato de token incorrecto." });
  }

  try {
    //const gafeteVerificado = jwt.verify(token, 'mi_firma_secreta_123');
    const gafeteVerificado = jwt.verify(token, process.env.SECRET_KEY || 'mi_firma_secreta_123' );
    req.usuario = gafeteVerificado;
    next();
    
  } catch (error) {
    res.status(401).json({ error: "Tu token es inválido o ya expiró. Inicia sesión de nuevo." });
  }
};

module.exports = verificarToken;