const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
const firebaseContactService = require("../services/firebaseContactService");

const requiredFields = ["ma_xa", "ten_xa", "chief", "cap"];

const validatePayload = (payload) => {
    const missing = requiredFields.filter(
        (field) => payload[field] === undefined || payload[field] === null || payload[field] === ""
    );
    if (missing.length) {
        const err = new Error(`Thiếu trường bắt buộc: ${missing.join(", ")}`);
        err.statusCode = 400;
        throw err;
    }
};

const createContact = asyncHandler(async (req, res) => {
    validatePayload(req.body);
    const contact = await firebaseContactService.createContact(req.body);
    res.status(201).json({
        success: true,
        data: contact,
        message: "Tạo mới contact trên Firebase thành công",
    });
});

const listContacts = asyncHandler(async (req, res) => {
    const { page = 1, pageSize, limit, fields, sort } = req.query;
    const size = pageSize || limit || 20;
    const result = await firebaseContactService.listContacts({ page, pageSize: size, fields, sort });
    res.status(200).json({
        success: true,
        ...result,
        message: "Lấy danh sách contact từ Firebase thành công",
    });
});

const getContactById = asyncHandler(async (req, res) => {
    const contact = await firebaseContactService.getContact(req.params.id);
    if (!contact) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy contact",
        });
    }
    res.status(200).json({
        success: true,
        data: contact,
        message: "Lấy thông tin contact từ Firebase thành công",
    });
});

const updateContact = asyncHandler(async (req, res) => {
    validatePayload(req.body);
    const updated = await firebaseContactService.updateContact(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy contact",
        });
    }
    res.status(200).json({
        success: true,
        data: updated,
        message: "Cập nhật contact trên Firebase thành công",
    });
});

const deleteContact = asyncHandler(async (req, res) => {
    const deleted = await firebaseContactService.deleteContact(req.params.id);
    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy contact",
        });
    }
    res.status(200).json({
        success: true,
        message: "Xóa contact trên Firebase thành công",
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

    const result = await firebaseContactService.importContactsFromExcel(data);

    res.status(200).json({
        success: true,
        message: "Import contact thành công",
        ...result,
    });
});

module.exports = {
    createContact,
    listContacts,
    getContactById,
    updateContact,
    deleteContact,
    importFromExcel,
};

