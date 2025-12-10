const asyncHandler = require('express-async-handler');
const CriminalService = require('../services/criminalService');

// Lấy danh sách đối tượng tội phạm
const getCriminals = asyncHandler(async (req, res) => {
    const { page, limit, fields, sort } = req.query;
    const { socialOrderId } = req.params;

    const response = await CriminalService.getCriminals(page, limit, fields, sort, socialOrderId);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách đối tượng tội phạm thành công",
    });
});

// Tạo mới đối tượng tội phạm
const createCriminal = asyncHandler(async (req, res) => {
    const response = await CriminalService.createCriminal(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo đối tượng tội phạm thành công",
    });
});

// Lấy thông tin đối tượng tội phạm theo ID
const getCriminalById = asyncHandler(async (req, res) => {
    const response = await CriminalService.getCriminalById(req.params.id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin đối tượng tội phạm thành công"
            : "Không tìm thấy đối tượng tội phạm",
    });
});

const getCriminalBySocialOrderId = asyncHandler(async (req, res) => {
    const response = await CriminalService.getCriminalBySocialOrderId(req.params.id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin đối tượng tội phạm thành công"
            : "Không tìm thấy đối tượng tội phạm",
    });
});

// Cập nhật đối tượng tội phạm
const updateCriminal = asyncHandler(async (req, res) => {
    const response = await CriminalService.updateCriminal(req.params.id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật đối tượng tội phạm thành công"
            : "Không thể cập nhật đối tượng tội phạm",
    });
});

// Xóa đối tượng tội phạm
const deleteCriminal = asyncHandler(async (req, res) => {
    const response = await CriminalService.deleteCriminal(req.params.id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa đối tượng tội phạm thành công"
            : "Không thể xóa đối tượng tội phạm",
    });
});

const getHistoryDetailByHistoryId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await CriminalService.getHistoryDetailByHistoryId(id);

    res.status(200).json({
        success: !!response,
        data: response || [],
        message: response
            ? "Lấy lịch sử chỉnh sửa thành công"
            : "Không tìm thấy lịch sử chỉnh sửa",
    });
});

module.exports = {
    getCriminals,
    createCriminal,
    getCriminalById,
    getCriminalBySocialOrderId,
    updateCriminal,
    deleteCriminal,
    getHistoryDetailByHistoryId,
};