const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
const firebaseCommuneService = require("../services/firebaseCommuneService");

const requiredFields = ["ma_xa", "ten_xa", "name", "loai", "cap", "ma_tinh", "ten_tinh"];

const validatePayload = (payload) => {
    const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
    if (missing.length) {
        const err = new Error(`Thiếu trường bắt buộc: ${missing.join(", ")}`);
        err.statusCode = 400;
        throw err;
    }
};

const createCommune = asyncHandler(async (req, res) => {
    validatePayload(req.body);
    const commune = await firebaseCommuneService.createCommune(req.body);
    res.status(201).json({
        success: true,
        data: commune,
        message: "Tạo mới xã/phường/thị trấn trên Firebase thành công",
    });
});

const listCommunes = asyncHandler(async (req, res) => {
    const { page = 1, pageSize, limit, fields, sort } = req.query;
    const size = pageSize || limit || 20;
    const result = await firebaseCommuneService.listCommunes({ page, pageSize: size, fields, sort });
    res.status(200).json({
        success: true,
        ...result,
        message: "Lấy danh sách xã/phường/thị trấn từ Firebase thành công",
    });
});

const getCommuneById = asyncHandler(async (req, res) => {
    const commune = await firebaseCommuneService.getCommune(req.params.id);
    if (!commune) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy xã/phường/thị trấn",
        });
    }
    res.status(200).json({
        success: true,
        data: commune,
        message: "Lấy thông tin xã/phường/thị trấn từ Firebase thành công",
    });
});

const updateCommune = asyncHandler(async (req, res) => {
    validatePayload(req.body);
    const updated = await firebaseCommuneService.updateCommune(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy xã/phường/thị trấn",
        });
    }
    res.status(200).json({
        success: true,
        data: updated,
        message: "Cập nhật xã/phường/thị trấn trên Firebase thành công",
    });
});

const deleteCommune = asyncHandler(async (req, res) => {
    const deleted = await firebaseCommuneService.deleteCommune(req.params.id);
    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy xã/phường/thị trấn",
        });
    }
    res.status(200).json({
        success: true,
        message: "Xóa xã/phường/thị trấn trên Firebase thành công",
    });
});

const importFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const result = await firebaseCommuneService.importCommunesFromExcel(data);

    res.status(200).json({
        success: true,
        message: "Import xã/phường/thị trấn thành công",
        ...result,
    });
});

module.exports = {
    createCommune,
    listCommunes,
    getCommuneById,
    updateCommune,
    deleteCommune,
    importFromExcel,
};

