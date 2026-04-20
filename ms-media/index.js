const express = require('express');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
console.log("Revisando llaves:", process.env.CLOUD_NAME ? "OK" : "VACÍO");

const app = express();
app.use(cors());

// Configuración de Cloudinary (Las llaves las sacas de su web, es gratis)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tuit-images',
        allowed_formats: ['jpg', 'png', 'jpeg']
    },
});

const upload = multer({ storage: storage });

// RUTA ÚNICA: Recibe imagen, devuelve URL
// RUTA ÚNICA: Manejo de errores manual para ver el problema real
app.post('/upload', (req, res) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            // AQUÍ es donde veremos el error real en la consola de Docker
            console.error("--- ERROR DE MULTER/CLOUDINARY ---");
            console.error(err);
            return res.status(500).json({
                error: "Fallo al subir a Cloudinary",
                message: err.message,
                stack: err.http_code // Cloudinary suele mandar códigos aquí
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No se recibió ningún archivo" });
        }

        console.log("¡Éxito! Archivo subido:", req.file.path);
        res.json({ url: req.file.path });
    });
});
app.listen(3000, () => console.log("ms-media listo en puerto 3000"));