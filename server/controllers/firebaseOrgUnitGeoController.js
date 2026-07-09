const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
const geoService = require("../services/firebaseOrgUnitGeoService");

const getByOrgUnit = asyncHandler(async (req, res) => {
    const item = await geoService.getOrgUnitGeo(req.params.orgUnitId);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin địa lý đơn vị" });
    }
    res.status(200).json({ success: true, data: item, message: "Lấy thông tin địa lý thành công" });
});

const upsertByOrgUnit = asyncHandler(async (req, res) => {
    const item = await geoService.upsertOrgUnitGeo({
        orgUnitId: req.params.orgUnitId,
        geoProfile: req.body.geoProfile || req.body,
    });
    res.status(200).json({ success: true, data: item, message: "Lưu thông tin địa lý thành công" });
});

const importFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Chưa tải file lên" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const result = await geoService.importOrgUnitGeosFromExcel(data);

    res.status(200).json({
        success: true,
        message: "Import địa lý đơn vị hoàn tất",
        ...result,
    });
});

module.exports = {
    getByOrgUnit,
    upsertByOrgUnit,
    importFromExcel,
};
