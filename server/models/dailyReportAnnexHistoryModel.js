const mongoose = require('mongoose');

const DailyReportAnnexHistorySchema = new mongoose.Schema({
    annexId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyReportAnnex',
        required: true,
    },
    dataSnapshot: {
        type: Object,
        required: true,
    },
    dailyReportHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyReportHistory',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DailyReportAnnexHistory', DailyReportAnnexHistorySchema);

