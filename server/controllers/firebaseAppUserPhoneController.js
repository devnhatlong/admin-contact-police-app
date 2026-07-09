const asyncHandler = require("express-async-handler");
const service = require("../services/firebaseAppUserPhoneService");

const listAppUserPhones = asyncHandler(async (req, res) => {
    const { appUserId, includeInactive, visibilityScope } = req.query;
    const items = await service.listAppUserPhones({
        appUserId,
        includeInactive: includeInactive !== "false",
        visibilityScope: visibilityScope || "all",
    });
    res.status(200).json({ success: true, items, total: items.length, message: "Lấy danh sách số điện thoại CBCS thành công" });
});

const createAppUserPhone = asyncHandler(async (req, res) => {
    const item = await service.createAppUserPhone(req.body);
    res.status(201).json({ success: true, data: item, message: "Thêm số điện thoại CBCS thành công" });
});

const updateAppUserPhone = asyncHandler(async (req, res) => {
    const item = await service.updateAppUserPhone(req.params.id, req.body);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy số điện thoại CBCS" });
    res.status(200).json({ success: true, data: item, message: "Cập nhật số điện thoại CBCS thành công" });
});

const deleteAppUserPhone = asyncHandler(async (req, res) => {
    const deleted = await service.deleteAppUserPhone(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy số điện thoại CBCS" });
    res.status(200).json({ success: true, message: "Xóa số điện thoại CBCS thành công" });
});

module.exports = {
    listAppUserPhones,
    createAppUserPhone,
    updateAppUserPhone,
    deleteAppUserPhone,
};
