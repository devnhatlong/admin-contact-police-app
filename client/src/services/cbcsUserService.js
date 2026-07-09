import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosCbcsUser = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/app-users`;

const cbcsUserService = {
    getAppUsers: async (page, pageSize, fields, sort, orgUnitId) => {
        const response = await axiosCbcsUser.get(`${BASE_URL}/`, {
            params: { page, pageSize, fields, sort, orgUnitId },
        });
        return response.data;
    },

    getAppUserById: async (id) => {
        const response = await axiosCbcsUser.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createAppUser: async (data) => {
        const response = await axiosCbcsUser.post(`${BASE_URL}/`, data);
        return response.data;
    },

    updateAppUser: async (id, data) => {
        const response = await axiosCbcsUser.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    updateAccountStatus: async (id, data) => {
        const response = await axiosCbcsUser.put(`${BASE_URL}/${id}/status`, data);
        return response.data;
    },

    sendActivationEmail: async (id) => {
        const response = await axiosCbcsUser.post(`${BASE_URL}/${id}/send-activation-email`);
        return response.data;
    },

    resendVerificationEmail: async (id) => {
        const response = await axiosCbcsUser.post(`${BASE_URL}/${id}/resend-verification-email`);
        return response.data;
    },

    updateRecoveryEmail: async (id, data) => {
        const response = await axiosCbcsUser.put(`${BASE_URL}/${id}/recovery-email`, data);
        return response.data;
    },

    deleteAppUser: async (id) => {
        const response = await axiosCbcsUser.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    bulkDeleteAppUsers: async (ids) => {
        const response = await axiosCbcsUser.post(`${BASE_URL}/bulk-delete`, { ids });
        return response.data;
    },

    deleteAllAppUsers: async () => {
        const response = await axiosCbcsUser.delete(`${BASE_URL}/all`);
        return response.data;
    },
};

export default cbcsUserService;
