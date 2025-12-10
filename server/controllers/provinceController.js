require('dotenv').config();
const ProvinceService = require("../services/provinceService");
const Province = require("../models/provinceModel");
const asyncHandler = require("express-async-handler");
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

        // Iterate over the data and create provinces
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { provinceName, provinceCode } = row;

            // Kiểm tra nếu thiếu provinceName
            if (!provinceName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên tỉnh/thành phố",
                });
                continue;
            }

            // Kiểm tra nếu provinceName đã tồn tại
            const existingProvince = await Province.findOne({ provinceName });
            if (existingProvince) {
                errors.push({
                    row: i + 1,
                    message: `Tên tỉnh/thành phố đã tồn tại (provinceName: ${provinceName})`,
                });
                continue;
            }

            // Tạo mới tỉnh/thành phố
            const newProvince = new Province({
                provinceName,
                provinceCode: provinceCode || "", // provinceCode là tùy chọn
            });

            await newProvince.save();
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
        console.error('Error importing provinces:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createProvince = asyncHandler(async (req, res) => {
    const { provinceName } = req.body;

    if (!provinceName) {
        throw new Error("Thiếu tên tỉnh/thành phố");
    }

    const response = await ProvinceService.createProvince(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo tỉnh/thành phố thành công",
    });
});

const getProvinces = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await ProvinceService.getProvinces(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách tỉnh/thành phố thành công",
    });
});

const getProvinceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ProvinceService.getProvinceById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin tỉnh/thành phố thành công"
            : "Không tìm thấy tỉnh/thành phố",
    });
});

const updateProvince = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { provinceName } = req.body;

    if (!provinceName) {
        throw new Error("Thiếu tên tỉnh/thành phố");
    }

    const response = await ProvinceService.updateProvince(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật tỉnh/thành phố thành công"
            : "Không thể cập nhật tỉnh/thành phố",
    });
});

const deleteProvince = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ProvinceService.deleteProvince(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa tỉnh/thành phố thành công"
            : "Không thể xóa tỉnh/thành phố",
    });
});

const deleteMultipleProvinces = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await ProvinceService.deleteMultipleProvinces(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa tỉnh/thành phố thành công"
            : "Không thể xóa tỉnh/thành phố",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createProvince,
    getProvinces,
    getProvinceById,
    updateProvince,
    deleteProvince,
    deleteMultipleProvinces
};