import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosJobPosition = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/job-positions`;

const jobPositionService = {
    getJobPositions: async (includeInactive = false) => {
        const response = await axiosJobPosition.get(`${BASE_URL}/`, {
            params: { includeInactive },
        });
        return response.data;
    },

    getJobPositionById: async (id) => {
        const response = await axiosJobPosition.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createJobPosition: async (data) => {
        const response = await axiosJobPosition.post(`${BASE_URL}/`, data);
        return response.data;
    },

    updateJobPosition: async (id, data) => {
        const response = await axiosJobPosition.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    setJobPositionActive: async (id, isActive) => {
        const response = await axiosJobPosition.put(`${BASE_URL}/${id}/active`, { isActive });
        return response.data;
    },

    deleteJobPosition: async (id) => {
        const response = await axiosJobPosition.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    bulkDeleteJobPositions: async (ids) => {
        const response = await axiosJobPosition.post(`${BASE_URL}/bulk-delete`, { ids });
        return response.data;
    },

    deleteAllJobPositions: async () => {
        const response = await axiosJobPosition.delete(`${BASE_URL}/all`);
        return response.data;
    },
};

export default jobPositionService;
