const mongoose = require('mongoose');

const SocialOrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fieldOfWork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FieldOfWork',
            required: true,
        },
        incidentDate: {
            type: Date,
            required: true,
        },
        commune: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commune',
            required: true,
        },
        province: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
            required: true,
        },
        crime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crime',
            required: true,
        },
        reportContent: {
            type: String,
            required: true,
        },
        investigationResult: {
            type: String,
            enum: ['Đã điều tra làm rõ', 'Đang điều tra', 'Đình chỉ', 'Tạm đình chỉ'],
            required: true,
        },
        handlingResult: {
            type: String,
            enum: ['Đã khởi tố', 'Đã xử lý hành chính', 'Chuyển cơ quan khác', 'Chưa có kết quả'],
            required: true,
        },
        severityLevel: {
            type: String,
            enum: ['Nghiêm trọng và ít nghiêm trọng', 'Rất nghiêm trọng', 'Đặc biệt nghiêm trọng'],
            required: true,
        },
        isHandledByCommune: {
            type: Boolean,
            default: false,
        },
        isExtendedCase: {
            type: Boolean,
            default: false,
        },
        isGangRelated: {
            type: Boolean,
            default: false,
        },
        hasAssignmentDecision: {
            type: Boolean,
            default: false,
        },

        // === Trạng thái xử lý
        status: {
            type: String,
            enum: [
                'Chưa gửi',
                'Đã gửi lên Phòng',
                'Phòng trả lại',
                'Phòng đã phê duyệt',
                'Đã gửi lên Bộ',
            ],
            default: 'Chưa gửi',
        },

        // === Gửi lên phòng
        sentToDepartmentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        sentToDepartmentAt: {
            type: Date,
            default: null,
        },

        // === Phòng phê duyệt hoặc trả lại
        departmentApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        departmentApprovedAt: {
            type: Date,
            default: null,
        },
        note: {
            type: String,
            default: "",
        },

        // === Gửi lên Bộ
        sentToMinistryBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        sentToMinistryAt: {
            type: Date,
            default: null,
        },
        originalId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SocialOrder', SocialOrderSchema);