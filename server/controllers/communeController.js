require('dotenv').config();
const CommuneService = require("../services/communeService");
const Province = require("../models/provinceModel");
const Commune = require("../models/communeModel");
const asyncHandler = require("express-async-handler");
const xlsx = require('xlsx');

const importFromExcel = async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read the Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = []; // Lưu danh sách lỗi
        let successCount = 0; // Đếm số bản ghi thành công

        // Iterate over the data and create communes
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { communeName, communeCode, provinceName } = row;

            // Kiểm tra nếu thiếu communeName hoặc provinceName
            if (!communeName || !provinceName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên xã, phường, thị trấn hoặc tên tỉnh",
                });
                continue;
            }

            // Kiểm tra xem provinceName có tồn tại trong Province hay không
            const existingProvince = await Province.findOne({ provinceName });
            if (!existingProvince) {
                errors.push({
                    row: i + 1,
                    message: `Tên tỉnh không tồn tại (provinceName: ${provinceName})`,
                });
                continue;
            }

            // Kiểm tra xem communeName đã tồn tại hay chưa
            const existingCommune = await Commune.findOne({ communeName });
            if (existingCommune) {
                errors.push({
                    row: i + 1,
                    message: `Tên xã, phường, thị trấn đã tồn tại (communeName: ${communeName})`,
                });
                continue;
            }

            // Tạo mới xã, phường, thị trấn
            const newCommune = new Commune({
                communeName,
                communeCode: communeCode || "", // communeCode là tùy chọn
                provinceId: existingProvince._id, // Liên kết với tỉnh
            });

            await newCommune.save();
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
        console.error("Error importing communes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createCommune = asyncHandler(async (req, res) => {
    const { communeName, communeCode, provinceId } = req.body;

    if (!communeName || !provinceId) {
        throw new Error("Thiếu tên xã, phường, thị trấn hoặc mã tỉnh");
    }

    const response = await CommuneService.createCommune(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo xã, phường, thị trấn thành công",
    });
});

const getCommunes = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await CommuneService.getCommunes(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách xã, phường, thị trấn thành công",
    });
});

const getCommuneById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await CommuneService.getCommuneById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin xã, phường, thị trấn thành công"
            : "Không tìm thấy xã, phường, thị trấn",
    });
});

const updateCommune = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { communeName, provinceId } = req.body;

    if (!communeName || !provinceId) {
        throw new Error("Thiếu tên xã, phường, thị trấn hoặc mã tỉnh");
    }

    const response = await CommuneService.updateCommune(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật xã, phường, thị trấn thành công"
            : "Không thể cập nhật xã, phường, thị trấn",
    });
});

const deleteCommune = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await CommuneService.deleteCommune(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa xã, phường, thị trấn thành công"
            : "Không thể xóa xã, phường, thị trấn",
    });
});

const deleteMultipleCommunes = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await CommuneService.deleteMultipleCommunes(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa xã, phường, thị trấn thành công"
            : "Không thể xóa xã, phường, thị trấn",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createCommune,
    getCommunes,
    getCommuneById,
    updateCommune,
    deleteCommune,
    deleteMultipleCommunes
};