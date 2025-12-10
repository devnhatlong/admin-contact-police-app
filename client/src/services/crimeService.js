import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosCrime = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/crime`;

const CrimeService = {
    // Tạo tội danh mới
    createCrime: async (data) => {
        try {
            const response = await axiosCrime.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo tội danh:", error);
            throw error;
        }
    },

    // Lấy danh sách tội danh với phân trang và lọc
    getCrimes: async (page, limit, fields, sort) => {
        try {
            const response = await axiosCrime.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tội danh:", error);
            throw error;
        }
    },

    // Lấy chi tiết tội danh theo ID
    getCrimeById: async (id) => {
        try {
            const response = await axiosCrime.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết tội danh:", error);
            throw error;
        }
    },

    // Cập nhật tội danh (chỉ admin)
    updateCrime: async (id, data) => {
        try {
            const response = await axiosCrime.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật tội danh:", error);
            throw error;
        }
    },

    // Xóa tội danh (chỉ admin)
    deleteCrime: async (id) => {
        try {
            const response = await axiosCrime.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa tội danh:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosCrime.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều tội danh:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosCrime.post(`${BASE_URL}/import-from-excel`, formData,
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

export default CrimeService;