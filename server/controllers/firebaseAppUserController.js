const asyncHandler = require("express-async-handler");
const firebaseAppUserService = require("../services/firebaseAppUserService");

const listAppUsers = asyncHandler(async (req, res) => {
    const { page = 1, pageSize, limit, fields, sort, orgUnitId } = req.query;
    const size = pageSize || limit || 10;
    let parsedFields = fields;
    if (typeof fields === "string") {
        try {
            parsedFields = JSON.parse(fields);
        } catch {
            parsedFields = {};
        }
    }

    const result = await firebaseAppUserService.listAppUsers({
        page,
        pageSize: size,
        fields: parsedFields,
        sort,
        orgUnitId,
    });

    res.status(200).json({
        success: true,
        ...result,
        data: result.items,
        message: "Lấy danh sách tài khoản CBCS thành công",
    });
});

const getAppUserById = asyncHandler(async (req, res) => {
    const user = await firebaseAppUserService.getAppUser(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: user,
        message: "Lấy thông tin tài khoản CBCS thành công",
    });
});

const createAppUser = asyncHandler(async (req, res) => {
    const user = await firebaseAppUserService.createAppUser(req.body, req.user._id);
    res.status(201).json({
        success: true,
        data: user,
        message: "Tạo tài khoản CBCS thành công. Email kích hoạt sẽ được gửi khi Cloud Function sẵn sàng.",
    });
});

const updateAppUser = asyncHandler(async (req, res) => {
    const updated = await firebaseAppUserService.updateAppUser(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: updated,
        message: "Cập nhật tài khoản CBCS thành công",
    });
});

const updateAccountStatus = asyncHandler(async (req, res) => {
    const updated = await firebaseAppUserService.updateAccountStatus(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: updated,
        message: "Cập nhật trạng thái tài khoản thành công",
    });
});

const updateRecoveryEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Thiếu email khôi phục",
        });
    }

    const updated = await firebaseAppUserService.updateRecoveryEmail(req.params.id, email);
    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: updated,
        message: "Đổi email khôi phục thành công. CBCS cần xác thực email mới.",
    });
});

const sendActivationEmail = asyncHandler(async (req, res) => {
    const result = await firebaseAppUserService.sendActivationEmail(req.params.id);
    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: result.user,
        message: result.message,
    });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const result = await firebaseAppUserService.resendVerificationEmail(req.params.id);
    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }

    res.status(200).json({
        success: true,
        data: result.user,
        message: "Đã ghi nhận yêu cầu gửi lại email xác thực",
    });
});

const deleteAppUser = asyncHandler(async (req, res) => {
    const deleted = await firebaseAppUserService.deleteAppUser(req.params.id);
    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy tài khoản CBCS",
        });
    }
    res.status(200).json({
        success: true,
        message: "Xóa tài khoản CBCS thành công",
    });
});

const bulkDeleteAppUsers = asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) {
        return res.status(400).json({
            success: false,
            message: "Danh sách ids không hợp lệ",
        });
    }
    const result = await firebaseAppUserService.deleteManyAppUsers(ids);
    res.status(200).json({
        success: true,
        ...result,
        message: `Đã xóa ${result.deletedCount} tài khoản CBCS`,
    });
});

const deleteAllAppUsers = asyncHandler(async (_req, res) => {
    const result = await firebaseAppUserService.deleteAllAppUsers();
    res.status(200).json({
        success: true,
        ...result,
        message: `Đã xóa ${result.deletedCount} tài khoản CBCS`,
    });
});

module.exports = {
    listAppUsers,
    getAppUserById,
    createAppUser,
    updateAppUser,
    updateAccountStatus,
    updateRecoveryEmail,
    sendActivationEmail,
    resendVerificationEmail,
    deleteAppUser,
    bulkDeleteAppUsers,
    deleteAllAppUsers,
};
