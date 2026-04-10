const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ==========================================
// 2. MAGIA DE SEGURIDAD (SINTAXIS MODERNA)
// ==========================================
// Quitamos la palabra "next" de aquí adentro
userSchema.pre('save', async function () {

    // Si la contraseña no se está modificando, cortamos la función con "return"
    if (!this.isModified('password')) {
        return;
    }

    // Generamos la sal y encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Como usamos async/await, Mongoose guarda automáticamente cuando termina esta línea
});

module.exports = mongoose.model('User', userSchema);