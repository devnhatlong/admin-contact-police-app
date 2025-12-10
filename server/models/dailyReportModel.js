const mongoose = require("mongoose");

const DailyReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Số văn bản
        reportNumber: {
            type: Number,
            trim: true,
            default: 1,
        },

        // ======= I. TÌNH HÌNH CHUNG =======
        // 1.1 An ninh
        securitySituation: {
            type: String,
            default: "",
        },
        securityDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.2 Trật tự xã hội
        socialOrderSituation: {
            type: String,
            default: "",
        },
        socialOrderDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.3 Kinh tế, tham nhũng, chức vụ, môi trường
        economicCorruptionEnvironment: {
            type: String,
            default: "",
        },
        economicDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.4 Ma túy
        drugSituation: {
            type: String,
            default: "",
        },
        drugDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.5 Tai nạn giao thông
        trafficAccidentSituation: {
            type: String,
            default: "",
        },
        trafficDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.6 Cháy nổ
        fireExplosionSituation: {
            type: String,
            default: "",
        },
        fireDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 1.7 Tình hình khác
        otherSituation: {
            type: String,
            default: "",
        },

        // ======= II. KẾT QUẢ CÁC MẶT CÔNG TÁC =======
        // 2.1 An ninh
        securityWork: {
            type: String,
            default: "",
        },
        securityWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.2 Trật tự xã hội
        socialOrderWork: {
            type: String,
            default: "",
        },
        socialOrderWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.3 Kinh tế, tham nhũng, chức vụ, môi trường
        economicCorruptionEnvironmentWork: {
            type: String,
            default: "",
        },
        economicWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.4 Ma túy
        drugWork: {
            type: String,
            default: "",
        },
        drugWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.5 Tai nạn giao thông
        trafficAccidentWork: {
            type: String,
            default: "",
        },
        trafficWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.6 Cháy nổ
        fireExplosionWork: {
            type: String,
            default: "",
        },
        fireWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // 2.7 Tình hình khác
        otherWork: {
            type: String,
            default: "",
        },
        otherWorkDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        }],

        // III. KIẾN NGHỊ, ĐỀ XUẤT
        recommendations: {
            type: String,
            default: "",
        },

        // Ghi chú cho các hành động (gửi, trả lại, phê duyệt, từ chối)
        note: {
            type: String,
            default: "",
        },

        // Ngày gửi báo cáo (khi ấn nút "Gửi báo cáo")
        submittedAt: {
            type: Date,
            default: null,
        },

        // ====== TRẠNG THÁI BÁO CÁO ======
        status: {
            type: String,
            enum: ["draft", "submitted", "approved", "rejected"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("DailyReport", DailyReportSchema);