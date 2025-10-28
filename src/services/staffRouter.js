import axios from "axios"
import { API_URL, getAuthorized } from "../utils/urls"

export const createstaff = async (staffdata) => {
    const { data } = await axios.post(`${API_URL}/staffs/register`, staffdata, getAuthorized())
    return data
}

export const editstaff = async ({ staffId, staffdata }) => {
    const { data } = await axios.put(`${API_URL}/staffs/edit-staffs/${staffId}`, staffdata, getAuthorized())
    return data
}

export const liststaffs = async () => {
    const { data } = await axios.get(`${API_URL}/staffs/get-staffs`, getAuthorized())
    return data
}

export const listagents = async () => {
    const { data } = await axios.get(`${API_URL}/staffs/get-agents`, getAuthorized())
    return data
}

export const deletestaff = async (id) => {
    const { data } = await axios.delete(`${API_URL}/staffs/delete-staffs/${id}`, getAuthorized())
    return data
}

export const changepassword = async ({ id, formdata }) => {
    const { data } = await axios.put(`${API_URL}/staffs/change-password/${id}`, formdata, getAuthorized())
    return data
}

export const profile_image = async (formData) => {
    const { data } = await axios.post(`${API_URL}/staffs/upload-profileimage`, formData, getAuthorized({'Content-Type':'multipart/form-data'}))
    return data
}