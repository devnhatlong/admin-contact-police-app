require('dotenv').config();
const ReportService = require("../services/reportService");
const asyncHandler = require("express-async-handler");

const createReport = asyncHandler(async (req, res) => {
    const { topicId, reportTypeId, reportContent } = req.body;
    const { _id: userId } = req.user;

    // Kiểm tra thông tin bắt buộc
    if (!userId || !topicId || !reportTypeId || !req.file) {
        throw new Error("Thiếu thông tin bắt buộc (userId, topicId, reportTypeId hoặc file)");
    }

    // Lấy thông tin file từ GridFS
    const fileId = req.fileId; // `_id` của file trong GridFS

    // Lưu báo cáo vào cơ sở dữ liệu
    const reportData = {
        userId,
        topicId,
        reportTypeId,
        fileId, // Lưu `_id` của file từ GridFS
        reportContent,
    };

    const savedReport = await ReportService.createReport(reportData);

    res.status(201).json({
        success: true,
        data: savedReport,
        message: "Gửi báo cáo thành công",
    });
});

const getReports = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    // Truyền thông tin user vào service
    const response = await ReportService.getReports(req.user, page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách báo cáo thành công",
    });
});

const getReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ReportService.getReportById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin báo cáo thành công"
            : "Không tìm thấy báo cáo",
    });
});

const updateReport = asyncHandler(async (req, res) => {
    const { id } = req.params; // Lấy ID báo cáo từ params
    const { topicId, reportTypeId, reportContent } = req.body; // Các trường cần cập nhật
    const file = req.file; // File mới (nếu có)

    // Kiểm tra thông tin bắt buộc
    if (!topicId || !reportTypeId || !reportContent) {
        throw new Error("Thiếu thông tin bắt buộc (topicId, reportTypeId hoặc reportContent)");
    }

    // Chuẩn bị dữ liệu để cập nhật
    const updateData = {
        topicId,
        reportTypeId,
        reportContent,
    };

    // Nếu có file mới, lưu file vào GridFS và cập nhật fileId
    if (file) {
        const fileId = req.fileId; // `_id` của file trong GridFS
        updateData.fileId = fileId; // Cập nhật fileId trong báo cáo
    }

    // Gọi service để cập nhật báo cáo
    const response = await ReportService.updateReport(id, updateData);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật báo cáo thành công"
            : "Không thể cập nhật báo cáo",
    });
});

const deleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ReportService.deleteReport(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa báo cáo thành công"
            : "Không thể xóa báo cáo",
    });
});

const deleteMultipleReports = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await ReportService.deleteMultipleReports(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa báo cáo thành công"
            : "Không thể xóa báo cáo",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    deleteMultipleReports
};