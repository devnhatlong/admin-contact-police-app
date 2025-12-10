import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosDailyReportAnnex = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/daily-report-annex`;

const dailyReportAnnexService = {
    // Tạo phụ lục báo cáo ngày mới
    createDailyReportAnnex: async (data) => {
        try {
            const response = await axiosDailyReportAnnex.post(`${BASE_URL}/`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lưu phụ lục báo cáo ngày:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },

    // Lấy danh sách phụ lục báo cáo ngày với phân trang và lọc
    getDailyReportAnnexes: async (page, limit, fields, sort) => {
        try {
            const response = await axiosDailyReportAnnex.get(`${BASE_URL}/`, {
                params: { page, limit, ...fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phụ lục báo cáo ngày:", error);
            throw error;
        }
    },

    // Lấy chi tiết phụ lục báo cáo ngày theo ID
    getDailyReportAnnexById: async (id) => {
        try {
            const response = await axiosDailyReportAnnex.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết phụ lục báo cáo ngày:", error);
            throw error;
        }
    },

    // Lấy phụ lục báo cáo theo dailyReportId
    getDailyReportAnnexByReportId: async (reportId) => {
        try {
            const response = await axiosDailyReportAnnex.get(`${BASE_URL}/by-report/${reportId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy phụ lục theo reportId:", error);
            throw error;
        }
    },

    // Lấy phụ lục báo cáo theo user và ngày
    getDailyReportAnnexByUserAndDate: async (reportDate) => {
        try {
            const response = await axiosDailyReportAnnex.get(`${BASE_URL}/by-user-date`, {
                params: { reportDate }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy phụ lục báo cáo theo ngày:", error);
            throw error;
        }
    },

    // Cập nhật phụ lục báo cáo ngày
    updateDailyReportAnnex: async (id, data) => {
        try {
            const response = await axiosDailyReportAnnex.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật phụ lục báo cáo ngày:", error);
            throw error;
        }
    },

    // Xóa phụ lục báo cáo ngày
    deleteDailyReportAnnex: async (id) => {
        try {
            const response = await axiosDailyReportAnnex.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa phụ lục báo cáo ngày:", error);
            throw error;
        }
    },

    // Xóa nhiều phụ lục báo cáo ngày
    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosDailyReportAnnex.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều phụ lục báo cáo ngày:", error);
            throw error;
        }
    },

    // Lấy thống kê theo khoảng thời gian
    getStatisticsByPeriod: async (periodType, startDate, endDate, departmentId, userId) => {
        try {
            const response = await axiosDailyReportAnnex.get(`${BASE_URL}/statistics-by-period`, {
                params: { periodType, startDate, endDate, departmentId, userId }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thống kê theo khoảng thời gian:", error);
            throw error;
        }
    },
    
    getStatisticsWithComparison: async (periodType = 'week', startDate = null, endDate = null, departmentId = null, userId = null, communeName = null) => {
        try {
            let url = `${BASE_URL}/statistics-comparison?periodType=${periodType}`;
            
            if (periodType === 'custom' && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            
            if (departmentId) {
                url += `&departmentId=${departmentId}`;
            }
            
            if (userId) {
                url += `&userId=${userId}`;
            }
            
            if (communeName) {
                url += `&communeName=${encodeURIComponent(communeName)}`;
            }
            
            const response = await axiosDailyReportAnnex.get(url);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thống kê so sánh:", error);
            throw error;
        }
    },
};

export default dailyReportAnnexService;