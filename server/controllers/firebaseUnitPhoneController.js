const asyncHandler = require("express-async-handler");
const firebaseUnitPhoneService = require("../services/firebaseUnitPhoneService");

const listUnitPhones = asyncHandler(async (req, res) => {
    const { orgUnitId, includeInactive } = req.query;
    const items = await firebaseUnitPhoneService.listUnitPhones({
        orgUnitId,
        includeInactive: includeInactive !== "false",
    });
    res.status(200).json({
        success: true,
        items,
        total: items.length,
        message: "Lấy danh sách SĐT đơn vị thành công",
    });
});

const getUnitPhoneById = asyncHandler(async (req, res) => {
    const item = await firebaseUnitPhoneService.getUnitPhone(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy SĐT đơn vị" });
    }
    res.status(200).json({ success: true, data: item, message: "Lấy SĐT đơn vị thành công" });
});

const createUnitPhone = asyncHandler(async (req, res) => {
    const item = await firebaseUnitPhoneService.createUnitPhone(req.body);
    res.status(201).json({ success: true, data: item, message: "Thêm SĐT đơn vị thành công" });
});

const updateUnitPhone = asyncHandler(async (req, res) => {
    const item = await firebaseUnitPhoneService.updateUnitPhone(req.params.id, req.body);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy SĐT đơn vị" });
    }
    res.status(200).json({ success: true, data: item, message: "Cập nhật SĐT đơn vị thành công" });
});

const setUnitPhoneActive = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const item = await firebaseUnitPhoneService.setUnitPhoneActive(req.params.id, isActive);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy SĐT đơn vị" });
    }
    res.status(200).json({
        success: true,
        data: item,
        message: isActive ? "Đã kích hoạt SĐT" : "Đã ẩn SĐT",
    });
});

const deleteUnitPhone = asyncHandler(async (req, res) => {
    const deleted = await firebaseUnitPhoneService.deleteUnitPhone(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Không tìm thấy SĐT đơn vị" });
    }
    res.status(200).json({ success: true, message: "Xóa SĐT đơn vị thành công" });
});

module.exports = {
    listUnitPhones,
    getUnitPhoneById,
    createUnitPhone,
    updateUnitPhone,
    setUnitPhoneActive,
    deleteUnitPhone,
};
