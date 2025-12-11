const asyncHandler = require("express-async-handler");
const firebaseContactService = require("../services/firebaseContactService");

const requiredFields = ["ma_xa", "ten_xa", "chief"];

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
    const { page = 1, pageSize = 20 } = req.query;
    const result = await firebaseContactService.listContacts({ page, pageSize });
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

module.exports = {
    createContact,
    listContacts,
    getContactById,
    updateContact,
    deleteContact,
};

