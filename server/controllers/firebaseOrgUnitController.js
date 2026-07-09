const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
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

const importFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Chưa tải file lên" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const result = await firebaseOrgUnitService.importOrgUnitsFromExcel(data);

    res.status(200).json({
        success: true,
        message: "Import đơn vị tổ chức hoàn tất",
        ...result,
    });
});

const deleteOrgUnit = asyncHandler(async (req, res) => {
    const result = await firebaseOrgUnitService.deleteOrgUnit(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn vị" });
    }
    res.status(200).json({
        success: true,
        ...result,
        message: "Đã xóa đơn vị và dữ liệu liên quan",
    });
});

const deleteAllOrgUnits = asyncHandler(async (_req, res) => {
    const result = await firebaseOrgUnitService.deleteAllOrgUnits();
    res.status(200).json({
        success: true,
        ...result,
        message: "Đã xóa toàn bộ dữ liệu đơn vị và CBCS liên quan để import lại từ đầu",
    });
});

module.exports = {
    getOrgUnitTree,
    listOrgUnits,
    getOrgUnitById,
    createOrgUnit,
    updateOrgUnit,
    setOrgUnitActive,
    importFromExcel,
    deleteOrgUnit,
    deleteAllOrgUnits,
};
