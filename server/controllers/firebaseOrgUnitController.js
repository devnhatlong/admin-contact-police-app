const asyncHandler = require("express-async-handler");
const firebaseOrgUnitService = require("../services/firebaseOrgUnitService");

const getOrgUnitTree = asyncHandler(async (req, res) => {
    const includeInactive = req.query.includeInactive !== "false";
    const tree = await firebaseOrgUnitService.getOrgUnitTree({ includeInactive });
    res.status(200).json({
        success: true,
        data: tree,
        message: "Lấy cây đơn vị tổ chức thành công",
    });
});

const listOrgUnits = asyncHandler(async (req, res) => {
    const includeInactive = req.query.includeInactive !== "false";
    const items = await firebaseOrgUnitService.listAllOrgUnits({ includeInactive });
    res.status(200).json({
        success: true,
        items,
        total: items.length,
        message: "Lấy danh sách đơn vị thành công",
    });
});

const getOrgUnitById = asyncHandler(async (req, res) => {
    const item = await firebaseOrgUnitService.getOrgUnit(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn vị" });
    }
    res.status(200).json({ success: true, data: item, message: "Lấy thông tin đơn vị thành công" });
});

const createOrgUnit = asyncHandler(async (req, res) => {
    const item = await firebaseOrgUnitService.createOrgUnit(req.body);
    res.status(201).json({ success: true, data: item, message: "Tạo đơn vị thành công" });
});

const updateOrgUnit = asyncHandler(async (req, res) => {
    const item = await firebaseOrgUnitService.updateOrgUnit(req.params.id, req.body);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn vị" });
    }
    res.status(200).json({ success: true, data: item, message: "Cập nhật đơn vị thành công" });
});

const setOrgUnitActive = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const item = await firebaseOrgUnitService.setOrgUnitActive(req.params.id, isActive);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn vị" });
    }
    res.status(200).json({
        success: true,
        data: item,
        message: isActive ? "Đã kích hoạt đơn vị" : "Đã ẩn đơn vị",
    });
});

module.exports = {
    getOrgUnitTree,
    listOrgUnits,
    getOrgUnitById,
    createOrgUnit,
    updateOrgUnit,
    setOrgUnitActive,
};
