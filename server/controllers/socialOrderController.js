const asyncHandler = require('express-async-handler');
const SocialOrderService = require('../services/socialOrderService');

// Lấy danh sách vụ việc
const getSocialOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;
    const response = await SocialOrderService.getSocialOrders(req.user, page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách vụ việc thành công",
    });
});

// Tạo mới vụ việc
const createSocialOrder = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    const response = await SocialOrderService.createSocialOrder(req.body, userId);

    res.status(201).json({
        success: true,
        data: response,
        message: "Gửi vụ việc thành công",
    });
});

// Lấy thông tin vụ việc theo ID
const getSocialOrderById = asyncHandler(async (req, res) => {
    const response = await SocialOrderService.getSocialOrderById(req.params.id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response.form || null,
        message: response
            ? "Lấy thông tin vụ việc thành công"
            : "Không tìm thấy vụ việc",
    });
});

// Cập nhật vụ việc
const updateSocialOrder = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    const response = await SocialOrderService.updateSocialOrder(req.params.id, req.body, userId);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật vụ việc thành công"
            : "Không thể cập nhật vụ việc",
    });
});

// Xóa vụ việc
const deleteSocialOrder = asyncHandler(async (req, res) => {
    const response = await SocialOrderService.deleteSocialOrder(req.params.id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa vụ việc thành công"
            : "Không thể xóa vụ việc",
    });
});

// Xóa nhiều vụ việc
const deleteMultipleSocialOrders = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await SocialOrderService.deleteMultipleSocialOrders(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa vụ việc thành công"
            : "Không thể xóa vụ việc",
        deletedCount: response.deletedCount,
    });
});

// Lấy lịch sử chỉnh sửa theo ID vụ việc
const getHistoryBySocialOrderId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await SocialOrderService.getHistoryBySocialOrderId(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || [],
        message: response
            ? "Lấy lịch sử chỉnh sửa thành công"
            : "Không tìm thấy lịch sử chỉnh sửa",
    });
});

const getHistoryDetailByHistoryId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await SocialOrderService.getHistoryDetailByHistoryId(id);

    res.status(200).json({
        success: !!response,
        data: response || [],
        message: response
            ? "Lấy lịch sử chỉnh sửa thành công"
            : "Không tìm thấy lịch sử chỉnh sửa",
    });
});

// Gửi vụ việc lên Phòng
const sendToDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { note } = req.body;

    const result = await SocialOrderService.sendToDepartment(id, userId, note);

    res.status(200).json({
        success: true,
        data: result,
        message: "Đã gửi vụ việc lên Phòng",
    });
});

// Phòng phê duyệt vụ việc
const approveSocialOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { note } = req.body;

    const result = await SocialOrderService.approveSocialOrder(id, userId, note);

    res.status(200).json({
        success: true,
        data: result,
        message: "Phê duyệt vụ việc thành công",
    });
});

// Phòng trả lại vụ việc cho xã
const returnSocialOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { note } = req.body;

    const result = await SocialOrderService.returnSocialOrder(id, userId, note);

    res.status(200).json({
        success: true,
        data: result,
        message: "Đã trả lại vụ việc cho xã",
    });
});

// Gửi vụ việc lên Bộ
const sendToMinistry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { note } = req.body;

    const result = await SocialOrderService.sendToMinistry(id, userId, note);

    res.status(200).json({
        success: true,
        data: result,
        message: "Đã gửi vụ việc lên Bộ",
    });
});

module.exports = {
    getSocialOrders,
    createSocialOrder,
    getSocialOrderById,
    updateSocialOrder,
    deleteSocialOrder,
    deleteMultipleSocialOrders,
    getHistoryBySocialOrderId,
    getHistoryDetailByHistoryId,
    sendToDepartment,
    approveSocialOrder,
    returnSocialOrder,
    sendToMinistry,
};