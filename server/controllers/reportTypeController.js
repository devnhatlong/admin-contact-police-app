const ReportTypeService = require("../services/reportTypeService");
const asyncHandler = require("express-async-handler");
const ReportType = require("../models/reportTypeModel");
const xlsx = require('xlsx');

const importFromExcel = async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = []; // Lưu danh sách lỗi
        let successCount = 0; // Đếm số bản ghi thành công

        // Iterate over the data and create field of work
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { reportTypeName, description } = row;

            // Kiểm tra nếu thiếu reportTypeName
            if (!reportTypeName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên chuyên đề",
                });
                continue;
            }

            // Kiểm tra xem reportTypeName đã tồn tại hay chưa
            const existingField = await ReportType.findOne({ reportTypeName });

            if (existingField) {
                errors.push({
                    row: i + 1,
                    message: `Tên chuyên đề đã tồn tại (reportTypeName: ${reportTypeName})`,
                });
                continue;
            }

            // Tạo mới chuyên đề
            const newField = new ReportType({
                reportTypeName,
                description,
            });

            await newField.save();
            successCount++; // Tăng số bản ghi thành công
        }

        res.status(200).json({
            success: true,
            message: "Import hoàn tất",
            successCount,
            errorCount: errors.length,
            errors, // Trả về danh sách lỗi
        });
    } catch (error) {
        console.error('Error importing field of work:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createReportType = asyncHandler(async (req, res) => {
    const { reportTypeName } = req.body;

    if (!reportTypeName) {
        throw new Error("Thiếu tên chuyên đề");
    }

    const response = await ReportTypeService.createReportType(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo chuyên đề thành công",
    });
});

const getReportTypes = asyncHandler(async (req, res) => {
    const { page = 1, limit, fields, sort } = req.query;

    const response = await ReportTypeService.getReportTypes(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách chuyên đề thành công",
    });
});

const getReportTypeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ReportTypeService.getReportTypeById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin chuyên đề thành công"
            : "Không tìm thấy chuyên đề",
    });
});

const updateReportType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reportTypeName } = req.body;

    if (!reportTypeName) {
        throw new Error("Thiếu tên chuyên đề");
    }

    const response = await ReportTypeService.updateReportType(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật chuyên đề thành công"
            : "Không thể cập nhật chuyên đề",
    });
});

const deleteReportType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ReportTypeService.deleteReportType(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa chuyên đề thành công"
            : "Không thể xóa chuyên đề",
    });
});

const deleteMultipleReportTypes = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await ReportTypeService.deleteMultipleReportTypes(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa chuyên đề thành công"
            : "Không thể xóa chuyên đề",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createReportType,
    getReportTypes,
    getReportTypeById,
    updateReportType,
    deleteReportType,
    deleteMultipleReportTypes
};