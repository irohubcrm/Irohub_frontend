import axios from "axios";
import { API_URL, getAuthorized } from "../utils/urls"

export const addRemainder = async (remainderdata) => {
    const { data } = await axios.post(`${API_URL}/remainder/addRemainder`, remainderdata, getAuthorized());
    return data;
}

export const showRemainder = async (remainderId) => {
    const { data } = await axios.get(`${API_URL}/remainder/showRemainder/${remainderId}`, getAuthorized());
    return data;
}

export const getRemainders = async () => {
    const { data } = await axios.get(`${API_URL}/remainder/getRemainders`, getAuthorized());
    return data;
}

export const updateRemainder = async (remainderId, remainderdata) => {
    const { data } = await axios.put(`${API_URL}/remainder/updateRemainder/${remainderId}`, remainderdata, getAuthorized());
    return data;
}

export const deleteRemainder = async (remainderId) => {
    const { data } = await axios.delete(`${API_URL}/remainder/deleteRemainder/${remainderId}`, getAuthorized());
    return data;
}