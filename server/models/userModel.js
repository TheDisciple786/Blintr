const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    bio: { type: String },
    interests: [{ type: String }],
    profile_photo: { 
        type: String,  // Will store the base64 string
        maxlength: 10 * 1024 * 1024 // 10MB max limit for base64 string
    },
    photo_visibility: { type: Boolean, default: false },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    looking_for: { type: String, enum: ['male', 'female', 'other', 'any'], required: true },
    dob: { type: Date, required: true },
    location: { city: String, country: String },
    last_active: { type: Date, default: Date.now },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }], 
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], 
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }], 
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }], 
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;