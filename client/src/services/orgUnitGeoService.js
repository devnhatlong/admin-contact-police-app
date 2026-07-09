import { createAxiosInstance } from '../utils/axiosUtils';

export const axiosOrgUnitGeo = createAxiosInstance();

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/org-unit-geos`;

const orgUnitGeoService = {
    importFromExcel: async (formData) => {
        const response = await axiosOrgUnitGeo.post(`${BASE_URL}/import-from-excel`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default orgUnitGeoService;
