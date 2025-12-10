import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosCriminal = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/criminal`;

const criminalService = {
    // Tạo mới dữ liệu đối tượng
    createCriminal: async (data) => {
        try {
            const response = await axiosCriminal.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo dữ liệu đối tượng:", error);
            throw error;
        }
    },

    // Lấy danh sách dữ liệu đối tượng
    getCriminals: async (page, limit, fields, sort) => {
        try {
            const response = await axiosCriminal.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách dữ liệu đối tượng:", error);
            throw error;
        }
    },

    // Lấy chi tiết đối tượng theo ID
    getCriminalById: async (id) => {
        try {
            const response = await axiosCriminal.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đối tượng:", error);
            throw error;
        }
    },

    getCriminalBySocialOrderId: async (id) => {
        try {
            const response = await axiosCriminal.get(`${BASE_URL}/social-order/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đối tượng:", error);
            throw error;
        }
    },

    // Cập nhật đối tượng
    updateCriminal: async (id, data) => {
        try {
            const response = await axiosCriminal.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật đối tượng:", error);
            throw error;
        }
    },

    // Xóa dữ liệu đối tượng
    deleteCriminal: async (id) => {
        try {
            const response = await axiosCriminal.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa dữ liệu đối tượng:", error);
            throw error;
        }
    },

    // Xóa nhiều dữ liệu đối tượng
    deleteMultipleCriminal: async (ids) => {
        try {
            const response = await axiosCriminal.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều dữ liệu đối tượng:", error);
            throw error;
        }
    },

    getHistoryDetailByHistoryId: async (id) => {
        try {
            const response = await axiosCriminal.get(`${BASE_URL}/${id}/history-detail`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử chỉnh sửa vụ việc:", error);
            throw error;
        }
    },
};

export default criminalService;