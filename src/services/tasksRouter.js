import axios from "axios"
import { API_URL, getAuthorized } from "../utils/urls"


export const addtasks = async (taskdata) => {
    const { data } = await axios.post(`${API_URL}/tasks/add`, taskdata, getAuthorized())
    return data
}

export const listtask = async () => {
    const { data } = await axios.get(`${API_URL}/tasks/list`, getAuthorized())
    return data
}

export const listsubadmintask = async () => {
    const { data } = await axios.get(`${API_URL}/tasks/list-subadmintask`, getAuthorized())
    return data
}

export const edittask = async ({ taskId, taskdata }) => {
    const { data } = await axios.put(`${API_URL}/tasks/edit/${taskId}`, taskdata, getAuthorized())
    return data
}

export const updatetaskstatus = async ({ taskId, status }) => {
    const { data } = await axios.put(`${API_URL}/tasks/update-status/${taskId}`, { status }, getAuthorized())
    return data
}