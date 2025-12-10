const asyncHandler = require("express-async-handler");
const GeneralSettingService = require("../services/generalSettingService");

// Tạo một cài đặt mới
const createGeneralSetting = asyncHandler(async (req, res) => {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
        throw new Error("Thiếu key hoặc value cho cài đặt");
    }

    const newSetting = await GeneralSettingService.createGeneralSetting({ key, value, description });

    res.status(201).json({
        success: true,
        data: newSetting,
        message: "Tạo cài đặt thành công",
    });
});

// Lấy danh sách tất cả cài đặt
const getGeneralSettings = asyncHandler(async (req, res) => {
    const settings = await GeneralSettingService.getGeneralSettings();

    res.status(200).json({
        success: true,
        data: settings,
    });
});

// Lấy một cài đặt theo ID
const getGeneralSettingById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const setting = await GeneralSettingService.getGeneralSettingById(id);

    if (!setting) {
        res.status(404);
        throw new Error("Không tìm thấy cài đặt");
    }

    res.status(200).json({
        success: true,
        data: setting,
    });
});

// Cập nhật hoặc tạo mới một cài đặt dựa trên key
const updateGeneralSetting = asyncHandler(async (req, res) => {
    const { key, value, time } = req.body;

    if (!key || value === undefined) {
        throw new Error('Thiếu key hoặc value để cập nhật cài đặt');
    }

    const updatedSetting = await GeneralSettingService.updateGeneralSetting(key, value, time);

    res.status(200).json({
        success: true,
        data: updatedSetting,
        message: 'Cập nhật cài đặt thành công',
    });
});

module.exports = {
    createGeneralSetting,
    getGeneralSettings,
    getGeneralSettingById,
    updateGeneralSetting,
};