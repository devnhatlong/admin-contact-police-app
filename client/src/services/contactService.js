import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosContact = createAxiosInstance();

// API server prefix: /api/contacts (see server/routes/index.js)
const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/contacts`;

const contactService = {
    createContact: async (data) => {
        const response = await axiosContact.post(`${BASE_URL}/`, data);
        return response.data;
    },
    getContacts: async (page, pageSize, fields) => {
        const response = await axiosContact.get(`${BASE_URL}/`, {
            params: { page, pageSize, fields },
        });
        return response.data;
    },
    getContactById: async (id) => {
        const response = await axiosContact.get(`${BASE_URL}/${id}`);
        return response.data;
    },
    updateContact: async (id, data) => {
        const response = await axiosContact.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },
    deleteContact: async (id) => {
        const response = await axiosContact.delete(`${BASE_URL}/${id}`);
        return response.data;
    },
};

export default contactService;

