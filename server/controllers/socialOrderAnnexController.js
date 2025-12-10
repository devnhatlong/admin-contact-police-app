const asyncHandler = require('express-async-handler');
const SocialOrderAnnexService = require('../services/socialOrderAnnexService');

// Lấy danh sách phụ lục
const getAnnexes = asyncHandler(async (req, res) => {
    const { page, limit, fields, sort } = req.query;
    const { socialOrderId } = req.params;

    const response = await SocialOrderAnnexService.getAnnexes(page, limit, fields, sort, socialOrderId);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách phụ lục thành công",
    });
});

// Tạo mới phụ lục
const createAnnex = asyncHandler(async (req, res) => {
    const response = await SocialOrderAnnexService.createAnnex(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo phụ lục thành công",
    });
});

// Lấy thông tin phụ lục theo ID
const getAnnexById = asyncHandler(async (req, res) => {
    const response = await SocialOrderAnnexService.getAnnexById(req.params.id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin phụ lục thành công"
            : "Không tìm thấy phụ lục",
    });
});

const getAnnexBySocialOrderId = asyncHandler(async (req, res) => {
    const response = await SocialOrderAnnexService.getAnnexBySocialOrderId(req.params.id);

    res.status(200).json({
        success: true,
        data: response || null,
        message: response
            ? "Lấy thông tin phụ lục thành công"
            : "Không có dữ liệu phụ lục",
    });
});

// Cập nhật phụ lục
const updateAnnex = asyncHandler(async (req, res) => {
    const response = await SocialOrderAnnexService.updateAnnex(req.params.id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật phụ lục thành công"
            : "Không thể cập nhật phụ lục",
    });
});

// Xóa phụ lục
const deleteAnnex = asyncHandler(async (req, res) => {
    const response = await SocialOrderAnnexService.deleteAnnex(req.params.id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa phụ lục thành công"
            : "Không thể xóa phụ lục",
    });
});

const getHistoryDetailByHistoryId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await SocialOrderAnnexService.getHistoryDetailByHistoryId(id);

    res.status(200).json({
        success: !!response,
        data: response || [],
        message: response
            ? "Lấy lịch sử chỉnh sửa thành công"
            : "Không tìm thấy lịch sử chỉnh sửa",
    });
});

module.exports = {
    getAnnexes,
    createAnnex,
    getAnnexById,
    getAnnexBySocialOrderId,
    updateAnnex,
    deleteAnnex,
    getHistoryDetailByHistoryId
};