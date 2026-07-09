const asyncHandler = require("express-async-handler");
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

module.exports = {
    getByOrgUnit,
    upsertByOrgUnit,
};
