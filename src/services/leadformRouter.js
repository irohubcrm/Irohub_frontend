import axios from "axios";
import { API_URL, getAuthorized } from "../utils/urls";

export const getLeadforms = async () => {
    try {
        const response = await axios.get(`${API_URL}/leadforms`, {
            ...getAuthorized(),
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
