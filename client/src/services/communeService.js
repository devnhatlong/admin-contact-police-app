import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosCommune = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/communes`;

const communeService = {
    // Tạo xã, phường, thị trấn mới
    createCommune: async (data) => {
        try {
            const response = await axiosCommune.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Lấy danh sách xã, phường, thị trấn với phân trang và lọc
    getCommunes: async (page, pageSize, fields, sort ) => {
        try {
            const response = await axiosCommune.get(`${BASE_URL}/`, {
                params: { page, pageSize, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Lấy chi tiết xã, phường, thị trấn theo ID
    getCommuneById: async (id) => {
        try {
            const response = await axiosCommune.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Cập nhật xã, phường, thị trấn (chỉ admin)
    updateCommune: async (id, data) => {
        try {
            const response = await axiosCommune.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Xóa xã, phường, thị trấn (chỉ admin)
    deleteCommune: async (id) => {
        try {
            const response = await axiosCommune.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa xã, phường, thị trấn:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosCommune.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều xã, phường, thị trấn:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosCommune.post(`${BASE_URL}/import-from-excel`, formData,
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

export default communeService;