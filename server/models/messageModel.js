const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    sent_at: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
