import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosUnitPhone = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/unit-phones`;

const unitPhoneService = {
    getUnitPhones: async (orgUnitId, includeInactive = true) => {
        const response = await axiosUnitPhone.get(`${BASE_URL}/`, {
            params: { orgUnitId, includeInactive },
        });
        return response.data;
    },

    createUnitPhone: async (data) => {
        const response = await axiosUnitPhone.post(`${BASE_URL}/`, data);
        return response.data;
    },

    updateUnitPhone: async (id, data) => {
        const response = await axiosUnitPhone.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    setUnitPhoneActive: async (id, isActive) => {
        const response = await axiosUnitPhone.put(`${BASE_URL}/${id}/active`, { isActive });
        return response.data;
    },

    deleteUnitPhone: async (id) => {
        const response = await axiosUnitPhone.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    importFromExcel: async (formData) => {
        const response = await axiosUnitPhone.post(`${BASE_URL}/import-from-excel`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default unitPhoneService;
