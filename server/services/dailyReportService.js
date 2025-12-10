require('dotenv').config();
const DailyReport = require("../models/dailyReportModel");
const DailyReportAnnex = require("../models/dailyReportAnnexModel");
const DailyReportHistory = require("../models/dailyReportHistoryModel");
const DailyReportAnnexHistory = require("../models/dailyReportAnnexHistoryModel");
const Department = require("../models/departmentModel");
const User = require("../models/userModel");
const ROLE = require("../constants/role");

const getNextReportNumber = async (userId) => {
    try {
        const lastReport = await DailyReport.findOne({ userId })
            .sort({ reportNumber: -1 })
            .select('reportNumber');
        
        return lastReport ? (lastReport.reportNumber || 0) + 1 : 1;
    } catch (error) {
        console.error("Lỗi khi lấy số báo cáo tiếp theo:", error);
        return 1;
    }
};

// Hàm ghi lịch sử báo cáo
const recordHistory = async ({ dailyReportId, userId, action, dataSnapshot }) => {
    const history = await DailyReportHistory.create({
        dailyReportId,
        updatedBy: userId,
        action,
        dataSnapshot,
        updatedAt: new Date(),
    });

    return history;
};

// Hàm lưu lịch sử phụ lục
const saveAnnexHistory = async (dailyReportId, dailyReportHistoryId) => {
    const annex = await DailyReportAnnex.findOne({ dailyReportId });

    if (annex) {
        await DailyReportAnnexHistory.create({
            annexId: annex._id,
            dataSnapshot: annex.toObject(),
            dailyReportHistoryId,
            updatedAt: new Date(),
        });
    }
};

const createDailyReport = async (reportData) => {
    try {
        // Tự động tăng số báo cáo nếu chưa có
        if (!reportData.reportNumber) {
            reportData.reportNumber = await getNextReportNumber(reportData.userId);
        }
        
        // Kiểm tra reportNumber có bị trùng không
        const existingReport = await DailyReport.findOne({
            userId: reportData.userId,
            reportNumber: reportData.reportNumber
        });
        
        if (existingReport) {
            throw new Error(`Số báo cáo ${reportData.reportNumber} đã tồn tại. Vui lòng thử lại!`);
        }
        
        const dailyReport = new DailyReport(reportData);
        const savedReport = await dailyReport.save();
        
        // Ghi lịch sử tạo mới
        if (savedReport && reportData.userId) {
            const history = await recordHistory({
                dailyReportId: savedReport._id,
                userId: reportData.userId,
                action: 'Tạo mới',
                dataSnapshot: savedReport.toObject(),
            });
        }
        
        return savedReport;
    } catch (error) {
        console.error("Lỗi khi tạo báo cáo ngày:", error);
        throw error;
    }
};

const getDailyReports = async (user, page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Nếu không phải admin, xử lý theo role và departmentType
        if (user.role !== ROLE.ADMIN) {
            // TTTTCH xem tất cả báo cáo đã gửi (submitted và approved)
            if (user.role === ROLE.TTTTCH) {
                queries.status = { $in: ["submitted", "approved"] };
            } else {
                const userData = await User.findById(user._id).select('departmentId');
                if (!userData || !userData.departmentId) {
                    throw new Error("Không tìm thấy departmentId của người dùng");
                }

                const departmentData = await Department.findById(userData.departmentId).select('departmentType');
                if (!departmentData) {
                    throw new Error("Không tìm thấy thông tin phòng ban");
                }

                if (departmentData.departmentType === "Phòng ban") {
                    // Nếu là phòng ban, lấy tất cả báo cáo đã gửi
                    queries.status = { $in: ["submitted", "approved"] };
                }
                else if (departmentData.departmentType === "Xã, phường, thị trấn") {
                    // Lọc theo user nếu departmentType là "Xã, phường, thị trấn"
                    queries.userId = user._id;
                }
            }
        }
        
        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key] && fields[key] !== 'all') {
                    if (!['fromDate', 'toDate', 'departmentName', 'content', 'reportNumber'].includes(key)) {
                        queries[key] = { $regex: fields[key], $options: "i" };
                    }
                }
            }
            
            // Xử lý tìm kiếm reportNumber (số chính xác)
            if (fields.reportNumber) {
                queries.reportNumber = Number(fields.reportNumber);
            }
        }

        // Lấy tất cả dữ liệu từ cơ sở dữ liệu
        let data = await DailyReport.find(queries)
            .populate({
                path: 'userId',
                select: 'userName departmentId',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName',
                }
            })
            .populate('securityDepartments', 'departmentName')
            .populate('socialOrderDepartments', 'departmentName')
            .populate('economicDepartments', 'departmentName')
            .populate('drugDepartments', 'departmentName')
            .populate('trafficDepartments', 'departmentName')
            .populate('fireDepartments', 'departmentName')
            .populate('securityWorkDepartments', 'departmentName')
            .populate('socialOrderWorkDepartments', 'departmentName')
            .populate('economicWorkDepartments', 'departmentName')
            .populate('drugWorkDepartments', 'departmentName')
            .populate('trafficWorkDepartments', 'departmentName')
            .populate('fireWorkDepartments', 'departmentName')
            .populate('otherWorkDepartments', 'departmentName')
            .sort(sort || "-createdAt");

        // Lọc theo departmentName
        if (fields?.departmentName && fields.departmentName !== 'all') {
            data = data.filter((item) => {
                const departmentName = item.userId?.departmentId?.departmentName || '';
                return departmentName.toLowerCase().includes(fields.departmentName.toLowerCase());
            });
        }

        // Lọc theo content
        if (fields?.content) {
            data = data.filter((item) => {
                const searchContent = fields.content.toLowerCase();
                return (
                    (item.securitySituation && item.securitySituation.toLowerCase().includes(searchContent)) ||
                    (item.socialOrderSituation && item.socialOrderSituation.toLowerCase().includes(searchContent)) ||
                    (item.economicCorruptionEnvironment && item.economicCorruptionEnvironment.toLowerCase().includes(searchContent)) ||
                    (item.drugSituation && item.drugSituation.toLowerCase().includes(searchContent)) ||
                    (item.trafficAccidentSituation && item.trafficAccidentSituation.toLowerCase().includes(searchContent)) ||
                    (item.fireExplosionSituation && item.fireExplosionSituation.toLowerCase().includes(searchContent)) ||
                    (item.otherSituation && item.otherSituation.toLowerCase().includes(searchContent))
                );
            });
        }

        // Lọc dữ liệu theo fromDate và toDate
        if (fields?.fromDate || fields?.toDate) {
            data = data.filter((item) => {
                const dateValue = new Date(item.createdAt);
                if (fields.fromDate && new Date(fields.fromDate) > dateValue) {
                    return false;
                }
                if (fields.toDate && new Date(fields.toDate) < dateValue) {
                    return false;
                }
                return true;
            });
        }

        // Gắn thông tin phụ lục vào từng báo cáo
        const reportIds = data.map((item) => item._id);
        const annexes = await DailyReportAnnex.find({ dailyReportId: { $in: reportIds } });

        // Tạo một map để tra cứu nhanh annex
        const annexMap = annexes.reduce((acc, curr) => {
            acc[curr.dailyReportId.toString()] = curr;
            return acc;
        }, {});

        // Gắn annex vào từng bản ghi DailyReport
        data = data.map((item) => {
            const obj = item.toObject();
            const departmentName = obj.userId?.departmentId?.departmentName || null;
            return {
                ...obj,
                departmentName,
                annex: annexMap[item._id.toString()] || null,
            };
        });

        // Pagination
        const total = data.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
            success: true,
            data: paginatedData,
            total,
        };
    } catch (error) {
        console.error("Lỗi trong getDailyReports:", error);
        throw new Error("Không thể lấy danh sách báo cáo ngày");
    }
};

const getDailyReportById = async (id, userId, userRole) => {
    const report = await DailyReport.findById(id)
        .populate({
            path: "userId",
            populate: {
                path: "departmentId",
                model: "Department",
            },
        })
        .populate('securityDepartments', 'departmentName')
        .populate('socialOrderDepartments', 'departmentName')
        .populate('economicDepartments', 'departmentName')
        .populate('drugDepartments', 'departmentName')
        .populate('trafficDepartments', 'departmentName')
        .populate('fireDepartments', 'departmentName')
        .populate('securityWorkDepartments', 'departmentName')
        .populate('socialOrderWorkDepartments', 'departmentName')
        .populate('economicWorkDepartments', 'departmentName')
        .populate('drugWorkDepartments', 'departmentName')
        .populate('trafficWorkDepartments', 'departmentName')
        .populate('fireWorkDepartments', 'departmentName')
        .populate('otherWorkDepartments', 'departmentName');
    
    if (!report) {
        throw new Error("Không tìm thấy báo cáo");
    }
    
    // Kiểm tra quyền
    const isOwner = report.userId._id.toString() === userId.toString();
    const isAdmin = userRole === ROLE.ADMIN;
    const isTTTTCH = userRole === ROLE.TTTTCH;
    const isCAT = userRole === ROLE.CAT;
    const isSubmittedOrApproved = report.status === "submitted" || report.status === "approved";
    
    // Cho phép xem nếu:
    // 1. Admin: xem tất cả
    // 2. Owner: xem báo cáo của mình
    // 3. TTTTCH: xem báo cáo đã gửi (submitted hoặc approved)
    // 4. CAT: xem báo cáo đã gửi (submitted)
    if (!isAdmin && !isOwner) {
        if (isTTTTCH && isSubmittedOrApproved) {
            // TTTTCH có thể xem báo cáo đã gửi
        } else if (isCAT && report.status === "submitted") {
            // CAT có thể xem báo cáo đã gửi
        } else {
            throw new Error("Bạn không có quyền xem báo cáo này");
        }
    }
    
    // Tìm phụ lục tương ứng (dựa trên dailyReportId)
    const annex = await DailyReportAnnex.findOne({
        dailyReportId: report._id
    });
    
    return {
        ...report.toObject(),
        annex: annex
    };
};

const getDailyReportsByUser = async (userId) => {
    try {
        const reports = await DailyReport.find({ userId })
            .populate({
                path: "userId",
                populate: {
                    path: "departmentId",
                    model: "Department",
                },
            })
            .populate('securityDepartments', 'departmentName')
            .populate('socialOrderDepartments', 'departmentName')
            .populate('economicDepartments', 'departmentName')
            .populate('drugDepartments', 'departmentName')
            .populate('trafficDepartments', 'departmentName')
            .populate('fireDepartments', 'departmentName')
            .populate('securityWorkDepartments', 'departmentName')
            .populate('socialOrderWorkDepartments', 'departmentName')
            .populate('economicWorkDepartments', 'departmentName')
            .populate('drugWorkDepartments', 'departmentName')
            .populate('trafficWorkDepartments', 'departmentName')
            .populate('fireWorkDepartments', 'departmentName')
            .populate('otherWorkDepartments', 'departmentName')
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
        
        // Thêm thông tin phụ lục vào mỗi báo cáo
        const reportsWithAnnex = await Promise.all(reports.map(async (report) => {
            const annex = await DailyReportAnnex.findOne({
                dailyReportId: report._id
            });
            return {
                ...report.toObject(),
                annex: annex
            };
        }));
        
        return reportsWithAnnex;
    } catch (error) {
        console.error("Lỗi khi lấy báo cáo ngày theo user:", error);
        throw error;
    }
};

const updateDailyReport = async (id, updateData, userId, userRole) => {
    try {
        // Lấy báo cáo hiện tại để kiểm tra quyền
        const existingReport = await DailyReport.findById(id);
        
        if (!existingReport) {
            throw new Error("Không tìm thấy báo cáo");
        }
        
        const isOwner = existingReport.userId.toString() === userId.toString();
        const isAdmin = userRole === ROLE.ADMIN;
        const isTTTTCH = userRole === ROLE.TTTTCH;
        const isCAT = userRole === ROLE.CAT;
        
        // Kiểm tra quyền update:
        // 1. Admin: có thể update tất cả
        // 2. Owner: có thể update báo cáo của mình
        // 3. TTTTCH: có thể update báo cáo đã gửi (submitted) để trả lại hoặc phê duyệt
        // 4. CAT: có thể update báo cáo đã gửi (submitted) để trả lại hoặc phê duyệt
        if (!isAdmin && !isOwner) {
            // Nếu không phải admin và không phải owner
            if (isTTTTCH || isCAT) {
                // TTTTCH và CAT chỉ được update khi status là submitted hoặc approved
                if (existingReport.status !== 'submitted' && existingReport.status !== 'approved') {
                    throw new Error("Bạn không có quyền chỉnh sửa báo cáo này");
                }
            } else {
                throw new Error("Bạn không có quyền chỉnh sửa báo cáo này");
            }
        }
        
        // USER không được edit khi status là submitted hoặc approved (admin vẫn có thể edit)
        if (userRole === ROLE.USER && (existingReport.status === 'submitted' || existingReport.status === 'approved')) {
            throw new Error("Báo cáo đã được gửi/phê duyệt, không thể chỉnh sửa!");
        }
        
        // TTTTCH không được edit khi status là approved (chỉ được xem)
        if (userRole === ROLE.TTTTCH && existingReport.status === 'approved') {
            throw new Error("Báo cáo đã được phê duyệt, không thể chỉnh sửa!");
        }
        
        // Loại bỏ các trường không cần thiết trước khi cập nhật
        const { _id, createdAt, updatedAt, ...cleanedData } = updateData;
        
        // Xác định action dựa trên thay đổi status và set submittedAt nếu cần
        let action = 'Cập nhật báo cáo';
        let shouldRecordHistory = true; // Mặc định luôn ghi lịch sử
        
        if (updateData.status) {
            if (updateData.status === 'submitted' && existingReport.status === 'draft') {
                action = 'Gửi báo cáo';
                // Luôn set submittedAt khi gửi báo cáo (cập nhật mỗi lần gửi)
                cleanedData.submittedAt = new Date();
            } else if (updateData.status === 'rejected' && existingReport.status === 'submitted') {
                action = 'Trả lại báo cáo';
                // Không xóa submittedAt khi trả lại, giữ lại để biết đã gửi lúc nào
            } else if (updateData.status === 'approved' && existingReport.status === 'submitted') {
                action = 'Phê duyệt báo cáo';
            } else if (updateData.status === 'rejected') {
                action = 'Từ chối báo cáo';
            } else if (updateData.status === 'draft' && existingReport.status === 'submitted') {
                action = 'Trả lại báo cáo (draft)'; // Fallback cho trường hợp cũ
            }
        } else {
            // Nếu không có thay đổi status, chỉ ghi lịch sử nếu có thay đổi dữ liệu thực sự
            // (Có thể bỏ qua nếu chỉ update các trường không quan trọng)
            shouldRecordHistory = true; // Vẫn ghi lịch sử để đảm bảo track mọi thay đổi
        }
        
        const updatedReport = await DailyReport.findByIdAndUpdate(
            id,
            { $set: cleanedData },
            { new: true }
        );

        // Ghi lịch sử cập nhật (dataSnapshot sẽ chứa submittedAt nếu đã được set)
        if (updatedReport && userId && shouldRecordHistory) {
            const history = await recordHistory({
                dailyReportId: updatedReport._id,
                userId,
                action,
                dataSnapshot: updatedReport.toObject(), // Đã bao gồm submittedAt
            });

            // Lưu lịch sử phụ lục nếu có
            await saveAnnexHistory(updatedReport._id, history._id);
        }

        return updatedReport;
    } catch (error) {
        console.error("Lỗi khi cập nhật báo cáo ngày:", error);
        throw error;
    }
};

const deleteDailyReport = async (id, userId, userRole) => {
    try {
        // Lấy báo cáo hiện tại để kiểm tra quyền
        const existingReport = await DailyReport.findById(id);
        
        if (!existingReport) {
            throw new Error("Không tìm thấy báo cáo");
        }
        
        // Kiểm tra quyền: chỉ cho phép admin hoặc người tạo báo cáo được xóa
        if (userRole !== ROLE.ADMIN && existingReport.userId.toString() !== userId.toString()) {
            throw new Error("Bạn không có quyền xóa báo cáo này");
        }
        
        // USER và TTTTCH không được xóa khi status là approved
        if ((userRole === ROLE.USER || userRole === ROLE.TTTTCH) && existingReport.status === 'approved') {
            throw new Error("Báo cáo đã được phê duyệt, không thể xóa!");
        }
        
        // Lấy danh sách history IDs trước khi xóa
        const historyIds = await DailyReportHistory.find({ dailyReportId: id }, '_id');
        const historyIdList = historyIds.map(h => h._id);
        
        // Lấy danh sách annex IDs
        const annexes = await DailyReportAnnex.find({ dailyReportId: id });
        const annexIds = annexes.map(a => a._id);
        
        // Xóa báo cáo và tất cả dữ liệu liên quan
        await Promise.all([
            DailyReport.findByIdAndDelete(id),
            DailyReportHistory.deleteMany({ dailyReportId: id }),
            DailyReportAnnex.deleteMany({ dailyReportId: id }),
            DailyReportAnnexHistory.deleteMany({ annexId: { $in: annexIds } }),
            DailyReportAnnexHistory.deleteMany({ dailyReportHistoryId: { $in: historyIdList } })
        ]);
        
        return existingReport;
    } catch (error) {
        console.error("Lỗi khi xóa báo cáo ngày:", error);
        throw error;
    }
};

const deleteMultipleDailyReports = async (ids, userId, userRole) => {
    try {
        // Nếu không phải admin, kiểm tra quyền cho từng báo cáo
        if (userRole !== ROLE.ADMIN) {
            const reports = await DailyReport.find({ _id: { $in: ids } });
            
            const unauthorizedReports = reports.filter(
                report => report.userId.toString() !== userId.toString()
            );
            
            if (unauthorizedReports.length > 0) {
                throw new Error("Bạn không có quyền xóa một hoặc nhiều báo cáo được chọn");
            }
        }
        
        const response = await DailyReport.deleteMany({ _id: { $in: ids } });
        return {
            success: response.deletedCount > 0,
            deletedCount: response.deletedCount,
            message: response.deletedCount > 0 
                ? `Đã xóa ${response.deletedCount} báo cáo ngày thành công`
                : "Không có báo cáo ngày nào được xóa"
        };
    } catch (error) {
        console.error("Lỗi khi xóa nhiều báo cáo ngày:", error);
        throw error;
    }
};

// Lấy lịch sử theo dailyReportId
const getHistoryByDailyReportId = async (dailyReportId) => {
    try {
        const histories = await DailyReportHistory.find({ dailyReportId })
            .populate({
                path: 'updatedBy',
                select: 'userName',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName'
                }
            })
            .sort({ updatedAt: -1 }); // Sắp xếp mới nhất trước
        
        return histories;
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử báo cáo:", error);
        throw error;
    }
};

// Lấy chi tiết lịch sử theo historyId (bao gồm cả annex history)
const getHistoryDetailByHistoryId = async (historyId) => {
    try {
        const history = await DailyReportHistory.findById(historyId)
            .populate({
                path: 'updatedBy',
                select: 'userName',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName'
                }
            });
        
        if (!history) {
            throw new Error("Không tìm thấy lịch sử");
        }
        
        // Lấy lịch sử phụ lục liên quan
        const annexHistory = await DailyReportAnnexHistory.findOne({
            dailyReportHistoryId: historyId
        });
        
        return {
            history,
            annexHistory: annexHistory || null
        };
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết lịch sử:", error);
        throw error;
    }
};

module.exports = {
    createDailyReport,
    getDailyReports,
    getDailyReportById,
    getDailyReportsByUser,
    updateDailyReport,
    deleteDailyReport,
    deleteMultipleDailyReports,
    getNextReportNumber,
    getHistoryByDailyReportId,
    getHistoryDetailByHistoryId,
};