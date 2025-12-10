import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosFile = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/file`;

const fileService = {
    // Lấy danh file với phân trang và lọc
    getFiles: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosFile.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh file:", error);
            throw error;
        }
    },

    // Lấy chi tiết file theo ID
    getFileById: async (id) => {
        try {
            const response = await axiosFile.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết file:", error);
            throw error;
        }
    },

    getFileDownloadUrl: (fileId) => {
        return `${BASE_URL}/download/${fileId}`;
    },

    // Cập nhật file (chỉ admin)
    updateFile: async (id, data) => {
        try {
            const response = await axiosFile.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật file:", error);
            throw error;
        }
    },

    // Xóa file (chỉ admin)
    deleteFile: async (id) => {
        try {
            const response = await axiosFile.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa file:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosFile.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều file:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosFile.post(`${BASE_URL}/import-from-excel`, formData,
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

export default fileService;