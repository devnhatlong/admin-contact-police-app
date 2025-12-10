require('dotenv').config();
const CrimeService = require("../services/crimeService");
const FieldOfWork = require("../models/fieldOfWorkModel");
const asyncHandler = require("express-async-handler");
const Crime = require("../models/crimeModel");
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

        // Iterate over the data and create crimes
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { crimeName, fieldName, description } = row;

            // Kiểm tra nếu thiếu crimeName hoặc fieldName
            if (!crimeName || !fieldName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên tội danh hoặc tên lĩnh vực vụ việc",
                });
                continue;
            }

            // Kiểm tra xem fieldName có tồn tại trong FieldOfWork hay không
            const existingFieldOfWork = await FieldOfWork.findOne({ fieldName });
            if (!existingFieldOfWork) {
                errors.push({
                    row: i + 1,
                    message: `Tên lĩnh vực vụ việc không tồn tại (fieldName: ${fieldName})`,
                });
                continue;
            }

            // Kiểm tra xem crimeName đã tồn tại hay chưa
            const existingCrime = await Crime.findOne({ crimeName });
            if (existingCrime) {
                errors.push({
                    row: i + 1,
                    message: `Tên tội danh đã tồn tại (crimeName: ${crimeName})`,
                });
                continue;
            }

            // Tạo mới tội danh
            const newCrime = new Crime({
                crimeName,
                fieldId: existingFieldOfWork._id, // Sử dụng fieldId từ FieldOfWork
                description,
            });

            await newCrime.save();
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
        console.error('Error importing crimes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createCrime = asyncHandler(async (req, res) => {
    const { crimeName, fieldId } = req.body;

    if (!crimeName || !fieldId) {
        throw new Error("Thiếu tên tội danh hoặc mã lĩnh vực công việc");
    }

    const response = await CrimeService.createCrime(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo tội danh thành công",
    });
});

const getCrimes = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await CrimeService.getCrimes(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách tội danh thành công",
    });
});

const getCrimeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await CrimeService.getCrimeById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin tội danh thành công"
            : "Không tìm thấy tội danh",
    });
});

const updateCrime = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { crimeName, fieldId } = req.body;

    if (!crimeName || !fieldId) {
        throw new Error("Thiếu tên tội danh hoặc mã lĩnh vực công việc");
    }

    const response = await CrimeService.updateCrime(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật tội danh thành công"
            : "Không thể cập nhật tội danh",
    });
});

const deleteCrime = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await CrimeService.deleteCrime(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa tội danh thành công"
            : "Không thể xóa tội danh",
    });
});

const deleteMultipleCrimes = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await CrimeService.deleteMultipleCrimes(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa tội danh thành công"
            : "Không thể xóa tội danh",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createCrime,
    getCrimes,
    getCrimeById,
    updateCrime,
    deleteCrime,
    deleteMultipleCrimes
};