const GeneralSetting = require("../models/generalSettingModel");

// Tạo một cài đặt mới
const createGeneralSetting = async ({ key, value, description }) => {
    // Kiểm tra xem key đã tồn tại chưa
    const existingSetting = await GeneralSetting.findOne({ key });
    if (existingSetting) {
        throw new Error("Cài đặt với key này đã tồn tại");
    }

    // Tạo cài đặt mới
    const newSetting = new GeneralSetting({ key, value, description });
    return await newSetting.save();
};

// Lấy danh sách tất cả cài đặt
const getGeneralSettings = async () => {
    return await GeneralSetting.find();
};

// Lấy một cài đặt theo ID
const getGeneralSettingById = async (id) => {
    return await GeneralSetting.findById(id);
};

// Cập nhật hoặc tạo mới một cài đặt dựa trên key
const updateGeneralSetting = async (key, value, time = null) => {
    return await GeneralSetting.findOneAndUpdate(
        { key }, // Tìm kiếm theo key
        { value, time, updatedAt: Date.now() }, // Cập nhật giá trị và thời gian
        { new: true, upsert: true } // Tạo mới nếu không tìm thấy
    );
};


module.exports = {
    createGeneralSetting,
    getGeneralSettings,
    getGeneralSettingById,
    updateGeneralSetting,
};