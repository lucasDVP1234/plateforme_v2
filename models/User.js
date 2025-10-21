// models/User.js
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Enforce uniqueness
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: function () {
            return this.role === 'user';
        },
    },

    companyName: {
        type: String,
        required: function () {
            return this.role === 'user';
        },
    },
    googleId: String,
    password: String,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    job:String,
    role: { type: String, enum: ['user', 'admin', 'creator'], default: 'user' },
    
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
