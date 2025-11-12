import axios from "axios";
import { API_URL, getAuthorized } from "../utils/urls";

export const addleads = async (leadData) => {
  const { data } = await axios.post(
    `${API_URL}/leads/add`,
    leadData,
    getAuthorized()
  );
  return data;
};

export const listleads = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    priority,
    status,
    filterleads,
    assignedTo,
    searchText,
    date,
    startDate,
    endDate,
    sortBy,
  } = filters;

  const params = new URLSearchParams();

  const appendIfValid = (key, value, ignoreList = []) => {
    if (value && !ignoreList.includes(value)) params.append(key, value);
  };

  appendIfValid("page", page);
  appendIfValid("limit", limit);
  appendIfValid("priority", priority, ["Priority"]);
  appendIfValid("status", status, ["Status"]);
  appendIfValid("filterleads", filterleads, ["All"]);
  appendIfValid("assignedTo", assignedTo, ["AssignedTo"]);
  appendIfValid("date", date, ["Date"]);
  appendIfValid("sortBy", sortBy, ["Sort By"]);

  if (searchText?.trim()) params.append("searchText", searchText.trim());
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const { data } = await axios.get(`${API_URL}/leads/list?${params}`, getAuthorized());
  return data;
}

export const assignleads = async ({ leadId, staffId, isAssigning }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/assign/${leadId}`,
    { staffId, isAssigning },
    getAuthorized()
  );
  return data;
};

export const listopencustomers = async ({
  page = 1,
  limit = 10,
  priority,
  assignedTo,
  searchText,
  date,
  startDate,
  endDate,
  sortBy,
}) => {
  const params = new URLSearchParams({ page, limit });
  if (priority && priority !== "Priority") params.append("priority", priority);
  if (assignedTo && assignedTo !== "AssignedTo")
    params.append("assignedTo", assignedTo);
  if (searchText) params.append("searchText", searchText);
  if (date && date !== "Date") params.append("date", date);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (sortBy && sortBy !== "Sort By") params.append("sortBy", sortBy);

  const { data } = await axios.get(
    `${API_URL}/leads/list-openleads?${params.toString()}`,
    getAuthorized()
  );
  return data;
};

export const updateleadstatus = async ({ leadId, status }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/update-status/${leadId}`,
    { status },
    getAuthorized()
  );
  return data;
};

export const updatepriority = async ({ customerId, priority }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/update-priority/${customerId}`,
    { priority },
    getAuthorized()
  );
  return data;
};

export const updatecustomerdetails = async ({ customerId, customerData }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/update-details/${customerId}`,
    customerData,
    getAuthorized()
    
  );
  return data;
 
};
export const updateuserleadform = async ({ id, userDetails }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/update-userleadform/${id}`, 
    userDetails, 
    getAuthorized({ "Content-Type": "multipart/form-data" })
  );
  return data;
};


export const setnextfollowup = async ({ id, nextFollowUp }) => {
  const { data } = await axios.put(
    `${API_URL}/leads/set-nextfollowup/${id}`,
    { nextFollowUp },
    getAuthorized()
  );
  return data;
};

export const uploadbulkleads = async (leadData) => {
  const { data } = await axios.post(
    `${API_URL}/leads/upload-bulkleads`,
    leadData,
    getAuthorized({ "Content-Type": "multipart/form-data" })
  );
  return data;
};

export const deletemultipleleads = async ({ leadIds }) => {
  const { data } = await axios.delete(`${API_URL}/leads/delete-multipleleads`, {
    ...getAuthorized(),
    data: { leadIds }, // Send leadIds in the request body
  });
  return data;
};
