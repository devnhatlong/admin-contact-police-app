import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosServerDate = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/server-date`;

const serverDateService = {
    getServerDate: async () => {
        try {
            const response = await axiosServerDate.get(`${BASE_URL}/`);
            return response.data; // Trả về dữ liệu ngày giờ từ server
        } catch (error) {
            console.error("Lỗi khi lấy ngày giờ từ server:", error);
            throw new Error("Không thể lấy ngày giờ từ server. Vui lòng thử lại sau.");
        }
    }
};

export default serverDateService;