const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['match_request', 'message_received', 'photo_unlocked'], required: true },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
