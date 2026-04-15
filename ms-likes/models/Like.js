const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true
    },
    cantidad: {
        type: Number,
        default: 0
    },
    usuariosQueDieronLike: [String]
});

module.exports = mongoose.model('Like', likeSchema);