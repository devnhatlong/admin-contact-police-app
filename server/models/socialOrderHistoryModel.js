const mongoose = require('mongoose');

const SocialOrderHistorySchema = new mongoose.Schema({
    socialOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialOrder',
        required: true,
    },
    updatedBy: {  // Ai chỉnh sửa
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {  // Ví dụ: "Tạo mới", "Cập nhật", "Xóa"
        type: String,
        required: true,
    },
    dataSnapshot: {
        type: Object,
        required: true,
    },
    updatedAt: {  // Thời gian chỉnh sửa
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SocialOrderHistory', SocialOrderHistorySchema);