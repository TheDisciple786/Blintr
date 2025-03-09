const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reported_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
