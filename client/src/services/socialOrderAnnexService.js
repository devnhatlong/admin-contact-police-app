import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosAnnex = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/social-order-annex`;

const socialOrderAnnexService = {
    // Tạo mới dữ liệu phụ lục
    createAnnex: async (data) => {
        try {
            const response = await axiosAnnex.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo dữ liệu phụ lục:", error);
            throw error;
        }
    },

    // Lấy danh sách dữ liệu phụ lục
    getAnnexes: async (page, limit, fields, sort) => {
        try {
            const response = await axiosAnnex.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách dữ liệu phụ lục:", error);
            throw error;
        }
    },

    // Lấy chi tiết phụ lục theo ID
    getAnnexById: async (id) => {
        try {
            const response = await axiosAnnex.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết phụ lục:", error);
            throw error;
        }
    },

    // Lấy chi tiết phụ lục theo ID
    getAnnexBySocialOrderId: async (id) => {
        try {
            const response = await axiosAnnex.get(`${BASE_URL}/social-order/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết phụ lục:", error);
            throw error;
        }
    },

    // Cập nhật phụ lục
    updateAnnex: async (id, data) => {
        try {
            const response = await axiosAnnex.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật phụ lục:", error);
            throw error;
        }
    },

    // Xóa dữ liệu phụ lục
    deleteAnnex: async (id) => {
        try {
            const response = await axiosAnnex.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa dữ liệu phụ lục:", error);
            throw error;
        }
    },

    // Xóa nhiều dữ liệu phụ lục
    deleteMultipleAnnex: async (ids) => {
        try {
            const response = await axiosAnnex.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều dữ liệu phụ lục:", error);
            throw error;
        }
    },

    getHistoryDetailByHistoryId: async (id) => {
        try {
            const response = await axiosAnnex.get(`${BASE_URL}/${id}/history-detail`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử chỉnh sửa vụ việc:", error);
            throw error;
        }
    },
};

export default socialOrderAnnexService;