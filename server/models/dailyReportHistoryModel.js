const mongoose = require('mongoose');

const DailyReportHistorySchema = new mongoose.Schema({
    dailyReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyReport',
        required: true,
    },
    updatedBy: {  // Ai chỉnh sửa
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {  // Ví dụ: "Tạo mới", "Cập nhật", "Gửi báo cáo", "Trả lại", "Phê duyệt", "Xóa"
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

module.exports = mongoose.model('DailyReportHistory', DailyReportHistorySchema);

