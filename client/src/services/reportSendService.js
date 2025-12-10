import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosReport = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/report`;

const reportSendService = {
    // Tạo báo cáo mới (với file đính kèm)
    createReport: async (data) => {
        try {
            const response = await axiosReport.post(`${BASE_URL}/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi báo cáo:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },

    // Tạo báo cáo ngày (không cần file đính kèm)
    createDailyReport: async (data) => {
        try {
            const response = await axiosReport.post(`${BASE_URL}/daily`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lưu báo cáo ngày:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },

    // Lấy danh sách báo cáo với phân trang và lọc
    getReports: async (page, limit, fields, sort) => {
        try {
            const response = await axiosReport.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách báo cáo:", error);
            throw error;
        }
    },

    // Lấy chi tiết báo cáo theo ID
    getReportById: async (id) => {
        try {
            const response = await axiosReport.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết báo cáo:", error);
            throw error;
        }
    },

    // Cập nhật báo cáo (chỉ admin)
    updateReport: async (id, data) => {
        try {
            const response = await axiosReport.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật báo cáo:", error);
            throw error;
        }
    },

    // Xóa báo cáo (chỉ admin)
    deleteReport: async (id) => {
        try {
            const response = await axiosReport.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa báo cáo:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosReport.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều báo cáo:", error);
            throw error;
        }
    },
};

export default reportSendService;