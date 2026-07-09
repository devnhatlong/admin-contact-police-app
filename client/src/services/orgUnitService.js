import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosOrgUnit = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/org-units`;

const orgUnitService = {
    getOrgUnitTree: async (includeInactive = true) => {
        const response = await axiosOrgUnit.get(`${BASE_URL}/tree`, {
            params: { includeInactive },
        });
        return response.data;
    },

    getOrgUnits: async (includeInactive = true) => {
        const response = await axiosOrgUnit.get(`${BASE_URL}/`, {
            params: { includeInactive },
        });
        return response.data;
    },

    getOrgUnitById: async (id) => {
        const response = await axiosOrgUnit.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createOrgUnit: async (data) => {
        const response = await axiosOrgUnit.post(`${BASE_URL}/`, data);
        return response.data;
    },

    updateOrgUnit: async (id, data) => {
        const response = await axiosOrgUnit.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    setOrgUnitActive: async (id, isActive) => {
        const response = await axiosOrgUnit.put(`${BASE_URL}/${id}/active`, { isActive });
        return response.data;
    },

    importFromExcel: async (formData) => {
        const response = await axiosOrgUnit.post(`${BASE_URL}/import-from-excel`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteAllOrgUnits: async () => {
        const response = await axiosOrgUnit.delete(`${BASE_URL}/all`);
        return response.data;
    },
};

export default orgUnitService;
