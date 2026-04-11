const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true,
        maxLength: 280 // ¡Como el Twitter original!
    },
    // Hacemos referencia al usuario que lo escribió
    autorId: {
        type: String, // Usamos String porque nuestro _id del usuario clonado es un String
        required: true,
        ref: 'User'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);