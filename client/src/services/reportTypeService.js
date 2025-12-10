import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosReportType = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/report-type`;

const reportTypeService = {
    // Tạo loại báo cáo mới
    createReportType: async (data) => {
        try {
            const response = await axiosReportType.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo loại báo cáo:", error);
            throw error;
        }
    },

    // Lấy danh sách loại báo cáo với phân trang và lọc
    getReportTypes: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosReportType.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại báo cáo:", error);
            throw error;
        }
    },

    // Lấy chi tiết loại báo cáo theo ID
    getReportTypeById: async (id) => {
        try {
            const response = await axiosReportType.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết loại báo cáo:", error);
            throw error;
        }
    },

    // Cập nhật loại báo cáo (chỉ admin)
    updateReportType: async (id, data) => {
        try {
            const response = await axiosReportType.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật loại báo cáo:", error);
            throw error;
        }
    },

    // Xóa loại báo cáo (chỉ admin)
    deleteReportType: async (id) => {
        try {
            const response = await axiosReportType.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa loại báo cáo:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosReportType.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều loại báo cáo:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosReportType.post(`${BASE_URL}/import-from-excel`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi import file Excel:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },
};

export default reportTypeService;