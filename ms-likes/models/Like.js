const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true // Cada post tiene un solo registro de likes
    },
    cantidad: {
        type: Number,
        default: 0
    },
    usuariosQueDieronLike: [String] // Aquí guardaremos los IDs de los que dan "corazón"
});

module.exports = mongoose.model('Like', likeSchema);