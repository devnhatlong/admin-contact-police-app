import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosDepartment = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/department`;

const DepartmentService = {
    // Tạo đơn vị mới
    createDepartment: async (data) => {
        try {
            const response = await axiosDepartment.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo đơn vị:", error);
            throw error;
        }
    },

    // Lấy danh sách đơn vị với phân trang và lọc
    getDepartments: async (page, limit, fields, sort) => {
        try {
            const response = await axiosDepartment.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn vị:", error);
            throw error;
        }
    },

    // Lấy chi tiết đơn vị theo ID
    getDepartmentById: async (id) => {
        try {
            const response = await axiosDepartment.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn vị:", error);
            throw error;
        }
    },

    // Cập nhật đơn vị (chỉ admin)
    updateDepartment: async (id, data) => {
        try {
            const response = await axiosDepartment.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật đơn vị:", error);
            throw error;
        }
    },

    // Xóa đơn vị (chỉ admin)
    deleteDepartment: async (id) => {
        try {
            const response = await axiosDepartment.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa đơn vị:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosDepartment.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều đơn vị:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosDepartment.post(`${BASE_URL}/import-from-excel`, formData,
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

export default DepartmentService;