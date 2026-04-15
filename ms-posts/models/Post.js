const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true,
        maxLength: 280
    },
    
    autorId: {
        type: String, 
        required: true,
        ref: 'User'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);