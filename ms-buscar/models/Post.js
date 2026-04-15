const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    
    _id: { type: String, required: true },
    texto: { type: String, required: true },
    autorId: { type: String, ref: 'User' }
});
module.exports = mongoose.model('Post', postSchema);