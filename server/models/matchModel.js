const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matched_at: { type: Date, default: Date.now },
    chat_started: { type: Boolean, default: false },
    photos_unlocked: { type: Boolean, default: false }
});

const Match = mongoose.model('Match', MatchSchema);
module.exports = Match;
