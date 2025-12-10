const mongoose = require('mongoose');

const CriminalHistorySchema = new mongoose.Schema({
    criminalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Criminal',
        required: true,
    },
    dataSnapshot: {
        type: Object,
        required: true,
    },
    socialOrderHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialOrderHistory',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('CriminalHistory', CriminalHistorySchema);