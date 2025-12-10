import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosTopic = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/topic`;

const topicService = {
    // Tạo chuyên đề mới
    createTopic: async (data) => {
        try {
            const response = await axiosTopic.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo chuyên đề:", error);
            throw error;
        }
    },

    // Lấy danh sách chuyên đề với phân trang và lọc
    getTopics: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosTopic.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chuyên đề:", error);
            throw error;
        }
    },

    // Lấy chi tiết chuyên đề theo ID
    getTopicById: async (id) => {
        try {
            const response = await axiosTopic.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết chuyên đề:", error);
            throw error;
        }
    },

    // Cập nhật chuyên đề (chỉ admin)
    updateTopic: async (id, data) => {
        try {
            const response = await axiosTopic.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật chuyên đề:", error);
            throw error;
        }
    },

    // Xóa chuyên đề (chỉ admin)
    deleteTopic: async (id) => {
        try {
            const response = await axiosTopic.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa chuyên đề:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosTopic.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều chuyên đề:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosTopic.post(`${BASE_URL}/import-from-excel`, formData,
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

export default topicService;