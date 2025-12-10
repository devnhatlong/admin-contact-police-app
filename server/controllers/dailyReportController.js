require('dotenv').config();
const DailyReportService = require("../services/dailyReportService");
const asyncHandler = require("express-async-handler");

const createDailyReport = asyncHandler(async (req, res) => {
    const { 
        reportNumber,
        securitySituation,
        securityDepartments,
        socialOrderSituation,
        socialOrderDepartments,
        economicCorruptionEnvironment,
        economicDepartments,
        drugSituation,
        drugDepartments,
        trafficAccidentSituation,
        trafficDepartments,
        fireExplosionSituation,
        fireDepartments,
        otherSituation,
        securityWork,
        securityWorkDepartments,
        socialOrderWork,
        socialOrderWorkDepartments,
        economicCorruptionEnvironmentWork,
        economicWorkDepartments,
        drugWork,
        drugWorkDepartments,
        trafficAccidentWork,
        trafficWorkDepartments,
        fireExplosionWork,
        fireWorkDepartments,
        otherWork,
        otherWorkDepartments,
        recommendations,
        status
    } = req.body;
    const { _id: userId, departmentId } = req.user;

    // Kiểm tra thông tin bắt buộc
    if (!userId) {
        throw new Error("Thiếu thông tin bắt buộc (userId)");
    }

    // Lưu báo cáo vào cơ sở dữ liệu
    const reportData = {
        userId,
        departmentId,
        reportNumber,
        securitySituation,
        securityDepartments,
        socialOrderSituation,
        socialOrderDepartments,
        economicCorruptionEnvironment,
        economicDepartments,
        drugSituation,
        drugDepartments,
        trafficAccidentSituation,
        trafficDepartments,
        fireExplosionSituation,
        fireDepartments,
        otherSituation,
        securityWork,
        securityWorkDepartments,
        socialOrderWork,
        socialOrderWorkDepartments,
        economicCorruptionEnvironmentWork,
        economicWorkDepartments,
        drugWork,
        drugWorkDepartments,
        trafficAccidentWork,
        trafficWorkDepartments,
        fireExplosionWork,
        fireWorkDepartments,
        otherWork,
        otherWorkDepartments,
        recommendations,
        status: status || 'draft'
    };

    const savedReport = await DailyReportService.createDailyReport(reportData);

    res.status(201).json({
        success: true,
        data: savedReport,
        message: "Lưu báo cáo ngày thành công",
    });
});

const getNextReportNumber = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    
    const nextNumber = await DailyReportService.getNextReportNumber(userId);
    
    res.status(200).json({
        success: true,
        data: nextNumber,
    });
});

const getDailyReports = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, ...fields } = req.query;

    const response = await DailyReportService.getDailyReports(req.user, page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.data,
        total: response.total,
        message: "Lấy danh sách báo cáo ngày thành công",
    });
});

const getDailyReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        const response = await DailyReportService.getDailyReportById(
            id,
            req.user._id,
            req.user.role
        );

        res.status(200).json({
            success: true,
            data: response,
            message: "Lấy thông tin báo cáo ngày thành công",
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            data: null,
            message: error.message || "Không tìm thấy báo cáo ngày",
        });
    }
});

const getDailyReportsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const response = await DailyReportService.getDailyReportsByUser(userId);

    res.status(200).json({
        success: true,
        data: response || [],
        message: "Lấy danh sách báo cáo ngày thành công",
    });
});

const updateDailyReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        reportNumber,
        securitySituation,
        socialOrderSituation,
        economicCorruptionEnvironment,
        drugSituation,
        trafficAccidentSituation,
        fireExplosionSituation,
        otherSituation,
        securityWork,
        socialOrderWork,
        economicCorruptionEnvironmentWork,
        drugWork,
        trafficAccidentWork,
        fireExplosionWork,
        otherWork,
        recommendations,
        securityDepartments,
        socialOrderDepartments,
        economicDepartments,
        drugDepartments,
        trafficDepartments,
        fireDepartments,
        securityWorkDepartments,
        socialOrderWorkDepartments,
        economicWorkDepartments,
        drugWorkDepartments,
        trafficWorkDepartments,
        fireWorkDepartments,
        otherWorkDepartments,
        status,
        note
    } = req.body;

    // Chuẩn bị dữ liệu để cập nhật
    const updateData = {
        reportNumber,
        securitySituation,
        socialOrderSituation,
        economicCorruptionEnvironment,
        drugSituation,
        trafficAccidentSituation,
        fireExplosionSituation,
        otherSituation,
        securityWork,
        socialOrderWork,
        economicCorruptionEnvironmentWork,
        drugWork,
        trafficAccidentWork,
        fireExplosionWork,
        otherWork,
        recommendations,
        securityDepartments,
        socialOrderDepartments,
        economicDepartments,
        drugDepartments,
        trafficDepartments,
        fireDepartments,
        securityWorkDepartments,
        socialOrderWorkDepartments,
        economicWorkDepartments,
        drugWorkDepartments,
        trafficWorkDepartments,
        fireWorkDepartments,
        otherWorkDepartments,
        status,
        note
    };

    try {
        const response = await DailyReportService.updateDailyReport(
            id, 
            updateData, 
            req.user._id,
            req.user.role
        );

        res.status(200).json({
            success: true,
            data: response,
            message: "Cập nhật báo cáo ngày thành công",
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            data: null,
            message: error.message || "Không thể cập nhật báo cáo ngày",
        });
    }
});

const deleteDailyReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        const response = await DailyReportService.deleteDailyReport(
            id,
            req.user._id,
            req.user.role
        );

        res.status(200).json({
            success: true,
            message: "Xóa báo cáo ngày thành công",
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: error.message || "Không thể xóa báo cáo ngày",
        });
    }
});

const deleteMultipleDailyReports = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    try {
        const response = await DailyReportService.deleteMultipleDailyReports(
            ids,
            req.user._id,
            req.user.role
        );

        res.status(200).json({
            success: response.success,
            message: response.message,
            deletedCount: response.deletedCount,
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: error.message || "Không thể xóa báo cáo ngày",
            deletedCount: 0,
        });
    }
});

const getHistoryByDailyReportId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DailyReportService.getHistoryByDailyReportId(id);

    res.status(200).json({
        success: true,
        data: response || [],
        message: "Lấy lịch sử báo cáo ngày thành công",
    });
});

const getHistoryDetailByHistoryId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DailyReportService.getHistoryDetailByHistoryId(id);

    res.status(200).json({
        success: true,
        data: response,
        message: "Lấy chi tiết lịch sử báo cáo ngày thành công",
    });
});

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