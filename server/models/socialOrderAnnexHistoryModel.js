const mongoose = require('mongoose');

const SocialOrderAnnexHistorySchema = new mongoose.Schema({
    annexId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialOrderAnnex',
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

module.exports = mongoose.model('SocialOrderAnnexHistory', SocialOrderAnnexHistorySchema);