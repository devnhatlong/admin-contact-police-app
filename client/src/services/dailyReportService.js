import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosDailyReport = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/daily-report`;

const dailyReportService = {
    // Lấy số báo cáo tiếp theo
    getNextReportNumber: async () => {
        try {
            const response = await axiosDailyReport.get(`${BASE_URL}/next-number`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy số báo cáo tiếp theo:", error);
            throw error;
        }
    },

    // Tạo báo cáo ngày mới
    createDailyReport: async (data) => {
        try {
            const response = await axiosDailyReport.post(`${BASE_URL}/`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lưu báo cáo ngày:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },

    // Lấy danh sách báo cáo ngày với phân trang và lọc (dành cho admin)
    getDailyReports: async (page = 1, limit = 10, fields = {}, sort = '-createdAt') => {
        try {
            const response = await axiosDailyReport.get(`${BASE_URL}/`, {
                params: { page, limit, ...fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách báo cáo ngày:", error);
            throw error;
        }
    },

    // Lấy chi tiết báo cáo ngày theo ID
    getDailyReportById: async (id) => {
        try {
            const response = await axiosDailyReport.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết báo cáo ngày:", error);
            throw error;
        }
    },

    // Lấy danh sách báo cáo ngày theo userId
    getDailyReportsByUser: async (userId) => {
        try {
            const response = await axiosDailyReport.get(`${BASE_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy báo cáo ngày theo user:", error);
            throw error;
        }
    },

    // Cập nhật báo cáo ngày
    updateDailyReport: async (id, data) => {
        try {
            const response = await axiosDailyReport.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật báo cáo ngày:", error);
            throw error;
        }
    },

    // Xóa báo cáo ngày
    deleteDailyReport: async (id) => {
        try {
            const response = await axiosDailyReport.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa báo cáo ngày:", error);
            throw error;
        }
    },

    // Xóa nhiều báo cáo ngày
    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosDailyReport.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều báo cáo ngày:", error);
            throw error;
        }
    },
};

export default dailyReportService;