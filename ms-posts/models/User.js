const mongoose = require('mongoose');

// En ms-posts SOLO guardamos lo que nos importa para un post
const userSchema = new mongoose.Schema({
    // Sobrescribimos el _id para usar exactamente el mismo que generó ms-users
    _id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);