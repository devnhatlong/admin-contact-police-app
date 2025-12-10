import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosGeneralSetting = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/general-setting`;

const GeneralSettingService = {
    // Tạo cài đặt mới
    createGeneralSetting: async (data) => {
        try {
            const response = await axiosGeneralSetting.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo cài đặt:", error);
            throw error;
        }
    },

    // Lấy danh sách cài đặt
    getGeneralSettings: async () => {
        try {
            const response = await axiosGeneralSetting.get(`${BASE_URL}/`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cài đặt:", error);
            throw error;
        }
    },

    // Lấy chi tiết cài đặt theo ID
    getGeneralSettingById: async (id) => {
        try {
            const response = await axiosGeneralSetting.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết cài đặt:", error);
            throw error;
        }
    },

    // Cập nhật cài đặt (chỉ admin)
    updateGeneralSetting: async (key, value, time) => {
        try {
            const response = await axiosGeneralSetting.put(`${BASE_URL}`, { key, value, time });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật cài đặt với key "${key}":`, error);
            throw error;
        }
    },
};

export default GeneralSettingService;