import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosProvince = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/province`;

const provinceService = {
    // Tạo tỉnh/thành phố mới
    createProvince: async (data) => {
        try {
            const response = await axiosProvince.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo tỉnh/thành phố:", error);
            throw error;
        }
    },

    // Lấy danh sách tỉnh/thành phố với phân trang và lọc
    getProvinces: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosProvince.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
            throw error;
        }
    },

    // Lấy chi tiết tỉnh/thành phố theo ID
    getProvinceById: async (id) => {
        try {
            const response = await axiosProvince.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết tỉnh/thành phố:", error);
            throw error;
        }
    },

    // Cập nhật tỉnh/thành phố (chỉ admin)
    updateProvince: async (id, data) => {
        try {
            const response = await axiosProvince.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật tỉnh/thành phố:", error);
            throw error;
        }
    },

    // Xóa tỉnh/thành phố (chỉ admin)
    deleteProvince: async (id) => {
        try {
            const response = await axiosProvince.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa tỉnh/thành phố:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosProvince.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều tỉnh/thành phố:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosProvince.post(`${BASE_URL}/import-from-excel`, formData,
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

export default provinceService;