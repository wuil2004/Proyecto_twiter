const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: "Acceso denegado. No hay token." });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token malformado." });

    try {
        // Usamos EXACTAMENTE la misma firma secreta que en ms-users
        const verificado = jwt.verify(token, 'mi_firma_secreta_123');
        req.usuario = verificado; // Guardamos los datos del usuario en la petición
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;