const asyncHandler = require("express-async-handler");
const firebaseJobPositionService = require("../services/firebaseJobPositionService");

const listJobPositions = asyncHandler(async (req, res) => {
    const includeInactive = req.query.includeInactive === "true";
    const items = await firebaseJobPositionService.listJobPositions({ includeInactive });
    res.status(200).json({
        success: true,
        items,
        total: items.length,
        message: "Lấy danh sách chức vụ thành công",
    });
});

const getJobPositionById = asyncHandler(async (req, res) => {
    const item = await firebaseJobPositionService.getJobPosition(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
    }
    res.status(200).json({ success: true, data: item, message: "Lấy thông tin chức vụ thành công" });
});

const createJobPosition = asyncHandler(async (req, res) => {
    const item = await firebaseJobPositionService.createJobPosition(req.body);
    res.status(201).json({ success: true, data: item, message: "Tạo chức vụ thành công" });
});

const updateJobPosition = asyncHandler(async (req, res) => {
    const item = await firebaseJobPositionService.updateJobPosition(req.params.id, req.body);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
    }
    res.status(200).json({ success: true, data: item, message: "Cập nhật chức vụ thành công" });
});

const setJobPositionActive = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const item = await firebaseJobPositionService.setJobPositionActive(req.params.id, isActive);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
    }
    res.status(200).json({
        success: true,
        data: item,
        message: isActive ? "Đã kích hoạt chức vụ" : "Đã ẩn chức vụ",
    });
});

const deleteJobPosition = asyncHandler(async (req, res) => {
    const item = await firebaseJobPositionService.deleteJobPosition(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
    }
    res.status(200).json({ success: true, data: item, message: "Xóa chức vụ thành công" });
});

const bulkDeleteJobPositions = asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) {
        return res.status(400).json({ success: false, message: "Danh sách ids không hợp lệ" });
    }
    const result = await firebaseJobPositionService.deleteManyJobPositions(ids);
    res.status(200).json({
        success: true,
        ...result,
        message: `Đã xóa ${result.deletedCount} chức vụ`,
    });
});

const deleteAllJobPositions = asyncHandler(async (_req, res) => {
    const result = await firebaseJobPositionService.deleteAllJobPositions();
    res.status(200).json({
        success: true,
        ...result,
        message: `Đã xóa ${result.deletedCount} chức vụ`,
    });
});

module.exports = {
    listJobPositions,
    getJobPositionById,
    createJobPosition,
    updateJobPosition,
    setJobPositionActive,
    deleteJobPosition,
    bulkDeleteJobPositions,
    deleteAllJobPositions,
};
