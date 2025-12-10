const mongoose = require('mongoose');

// Declare the Schema for Daily Report Annex (Phụ lục báo cáo ngày)
var DailyReportAnnexSchema = new mongoose.Schema({
    userId: { // ID người dùng tạo báo cáo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dailyReportId: { // ID báo cáo chính mà phụ lục này thuộc về
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyReport',
        required: false, // Có thể null nếu chưa có báo cáo chính
    },
    // I. CÔNG TÁC ĐẤU TRANH PHÒNG, CHỐNG TỘI PHẠM
    crimeStatistics: {
        // 1. Tổng số vụ phát hiện, tiếp nhận, xử lý
        totalCasesDetected: { type: Number, default: 0 },
        totalCrimesDetectedReceivedProcessed: { type: Number, default: 0 },
        // 2. Trong đó, số đối tượng là người nước ngoài
        foreignerCriminals: { type: Number, default: 0 },
        
        // 1. Phạm tội về trật tự xã hội
        socialOrderCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
            totalVictims: { type: Number, default: 0 }, // Số đối tượng giết người
            totalDetainees: { type: Number, default: 0 }, // Số đối tượng cướp tài sản
            totalRobbery: { type: Number, default: 0 }, // Số vụ cướp tài sản
            totalTheft: { type: Number, default: 0 }, // Số vụ hiếp dâm
            totalFraud: { type: Number, default: 0 }, // Số đối tượng hiếp dâm
            totalViolentCrimes: { type: Number, default: 0 }, // Số vụ chống người thi hành công vụ
            totalDrugCrimes: { type: Number, default: 0 }, // Số đối tượng chống người thi hành công vụ
            gambling: { type: Number, default: 0 }, // Số vụ đánh bạc
            gamblingPersons: { type: Number, default: 0 }, // Số đối tượng đánh bạc
        },
        
        // 2. Phạm tội trật tự quản lý kinh tế, tham nhũng, chức vụ
        economicCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
        },
        
        // 3. Phạm tội về môi trường, an toàn thực phẩm
        environmentCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
        },
        
        // 4. Phạm tội về ma túy
        drugCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
        },
        
        // 5. Phạm tội về lĩnh vực công nghệ thông tin, mạng viễn thông
        cyberCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
        },
        
        // 6. Phạm tội xâm phạm an toàn giao thông
        trafficCrimes: {
            totalCases: { type: Number, default: 0 }, // Số vụ phát hiện
            totalSuspects: { type: Number, default: 0 }, // Số đối tượng phát hiện
        },
        
        // 7. Công tác truy nã
        fugitiveWork: {
            totalCrimesWanted: { type: Number, default: 0 }, //Số đối tượng truy nã bị bắt, vận động đầu thú, thanh loại
        },
        
        // 8. Tiếp nhận tin báo, tố giác tội phạm
        crimeReports: {
            totalReports: { type: Number, default: 0 }, // Số lượt tiếp nhận
            totalProcessed: { type: Number, default: 0 }, // Số lượt đã xử lý
        },
        
        // 9. Khởi tố, điều tra
        investigation: {
            // a. Tội phạm về trật tự xã hội
            socialOrderCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // b. Tội phạm về trật tự xã hội
            socialOrderCrimesB: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // c. Tội phạm về trật tự quản lý kinh tế, tham nhũng, chức vụ
            economicCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // d. Tội phạm về ma túy
            drugCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // e. Tội phạm về môi trường, an toàn thực phẩm
            environmentCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // g. Tội phạm về lĩnh vực công nghệ thông tin, mạng viễn thông
            cyberCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            },
            // h. Tội phạm xâm phạm an toàn giao thông
            trafficCrimes: {
                totalCases: { type: Number, default: 0 }, // Số vụ khởi tố mới
                totalSuspects: { type: Number, default: 0 }, // Số bị can khởi tố mới
            }
        }
    },
    
    // II. CÔNG TÁC QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI
    administrativeManagement: {
        // 10. Cháy
        fires: {
            totalCases: { type: Number, default: 0 }, // Số vụ
            deaths: { type: Number, default: 0 }, // Số người chết
            injured: { type: Number, default: 0 }, // Số người bị thương
            propertyDamage: { type: Number, default: 0 }, // Tài sản thiệt hại (triệu đồng)
        },
        
        // 11. Nổ
        explosions: {
            totalCases: { type: Number, default: 0 }, // Số vụ
            deaths: { type: Number, default: 0 }, // Số người chết
            injured: { type: Number, default: 0 }, // Số người bị thương
            propertyDamage: { type: Number, default: 0 }, // Tài sản thiệt hại (triệu đồng)
        },
        
        // 12. Tai nạn giao thông
        trafficAccidents: {
            totalCases: { type: Number, default: 0 }, // Số vụ
            deaths: { type: Number, default: 0 }, // Số người chết
            injured: { type: Number, default: 0 }, // Số người bị thương
            propertyDamage: { type: Number, default: 0 }, // Tài sản thiệt hại (triệu đồng)
        },
        
        // 13. Thu giữ, vận động, thu hồi vũ khí và công cụ hỗ trợ
        weaponSeizure: {
            guns: { type: Number, default: 0 }, // Súng (khẩu)
            bullets: { type: Number, default: 0 }, // Đạn (viên)
            knives: { type: Number, default: 0 }, // Vũ khí thô sơ (dao, kiếm...)
            explosives: { type: Number, default: 0 }, // Thuốc nổ (kg)
            cannons: { type: Number, default: 0 }, // Pháo (kg)
            others: { type: Number, default: 0 }, // Loại khác
        },
        
        // 14. Xuất, nhập cảnh tại cửa khẩu hàng không quốc tế
        immigration: {
            vietnameseExitEntry: { type: Number, default: 0 }, // Số lượt người Việt Nam xuất cảnh
            foreignerEntry: { type: Number, default: 0 }, // Số lượt người nước ngoài nhập cảnh
            totalIllegalEntriesAndExits: { type: Number, default: 0 }, // Số lượt người xuất, nhập cảnh trái phép
            illegalCrossing: { type: Number, default: 0 }, // Số vụ vi phạm quy định pháp luật YNC
            totalNotAllowedEntry: { type: Number, default: 0 }, // Số chưa cho nhập cảnh
            totalTemporaryExitSuspensionNumber: { type: Number, default: 0 }, // Số tạm hoãn xuất cảnh
        }
    },
    
    // III. Công tác xây dựng Đảng, xây dựng lực lượng
    partyBuilding: {
        // 1. Văn bản chỉ đạo của Đảng ủy
        partyDirectives: {
            totalDocuments: { type: Number, default: 0 },
        },
        
        // 2. Hoạt động phổ biến quán triết các văn bản chỉ đạo của Trung ương Đảng, Chính phủ
        propagandaActivities: {
            totalActivities: { type: Number, default: 0 },
        },
        
        // 3. Văn bản quy phạm pháp luật do Bộ Công an xây dựng, lãnh đạo xây dựng được ban hành
        legalDocuments: {
            laws: { type: Number, default: 0 }, // Luật
            decrees: { type: Number, default: 0 }, // Nghị định
            circulars: { type: Number, default: 0 }, // Thông tư
        },
        
        // 4. Công tác đối ngoại
        foreignAffairs: {
            foreignDelegationsToMinistry: { type: Number, default: 0 }, // Đoàn nước ngoài vào làm việc với Bộ Công an
            ministryDelegationsAbroad: { type: Number, default: 0 }, // Đoàn Bộ Công an ra nước ngoài công tác
            internationalConferences: { type: Number, default: 0 }, // Số hội nghị, hội thảo quốc tế do Công an nhận dẫn đăng cai tổ chức
        },
        
        // 5. Công tác cán bộ
        personnelWork: {
            appointedLeadersAndCommanders: { type: Number, default: 0 }, // Lãnh đạo, chỉ huy (tự cấp phòng trở lên) được bổ nhiệm
            officersLyingInWorkingTime: { type: Number, default: 0 }, // Số CBCS hy sinh trong khi thi hành công vụ
            officersInjuredWhilePerformingDuties: { type: Number, default: 0 }, // Số CBCS bị thương trong khi thi hành công vụ
            collectivesAndIndividualsAwarded: { type: Number, default: 0 }, // Số lượt tập thể, cá nhân được khen thưởng (khen thưởng đột xuất, khen chuyên đề - Bằng khen Bộ trở lên)
            totalOfficersAndSoldiersDisciplined: { type: Number, default: 0 }, // Tổng số CBCS bị xử lý kỷ luật
            stripCANDBadge: { type: Number, default: 0 }, // Trong đó, tước đánh hiệu CAND
        },
        
        // 6. Công tác thanh tra, giải quyết khiếu nại, tố cáo
        inspection: {
            petitionsAndComplaintsUnderJurisdiction: { type: Number, default: 0 }, // Đơn thư khiếu nại, tố cáo thuộc trách nhiệm giải quyết của đơn vị
            petitionsAndComplaintsResolved: { type: Number, default: 0 }, // Đơn thư khiếu nại tố cáo đã giải quyết
            policeOfficersDisciplinedThroughInspection: { type: Number, default: 0 }, // Số CBCS Công an bị xử lý kỷ luật qua công tác thanh tra
        },
        
        // 7. Công tác kiểm tra đảng
        partyInspection: {
            partyOrganizationsAccused: { type: Number, default: 0 }, // Số tổ chức đảng trong CAND bị tổ cáo
            partyMembersAccused: { type: Number, default: 0 }, // Số đảng viên trong CAND bị tổ cáo
            partyOrganizationsWithViolations: { type: Number, default: 0 }, // Số tổ chức Đảng tó có những vi phạm qua công tác kiểm tra
            partyMembersWithViolations: { type: Number, default: 0 }, // Số đảng viên kết luận có vi phạm qua công tác kiểm tra
            policeOfficersDisciplined: { type: Number, default: 0 }, // Số tổ chức đảng trong Công an nhân dân bị xử lý kỷ luật
            partyMembersDisciplined: { type: Number, default: 0 }, // Số đảng viên bị xử lý kỷ luật
        }
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo index compound dựa trên userId và ngày tạo (một user chỉ có thể tạo một phụ lục cho mỗi ngày)
// Sử dụng virtual field hoặc application logic để kiểm soát duplicate theo ngày
// DailyReportAnnexSchema.index({ userId: 1, reportDate: 1 }, { unique: true });

// Export the model - Model cho phụ lục báo cáo ngày với các thống kê chi tiết
module.exports = mongoose.model('DailyReportAnnex', DailyReportAnnexSchema);