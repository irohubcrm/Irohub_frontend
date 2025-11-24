import axios from "axios";

const API_URL = "http://localhost:5000/api/dashboard"; // Assuming your backend runs on port 5000

const getLeadStatusDistribution = async () => {
  const response = await axios.get(`${API_URL}/lead-status-distribution`);
  return response.data;
};

const getLeadSourceDistribution = async () => {
  const response = await axios.get(`${API_URL}/lead-source-distribution`);
  return response.data;
};

const getPaymentStatusDistribution = async () => {
  const response = await axios.get(`${API_URL}/payment-status-distribution`);
  return response.data;
};

const getPaymentTrends = async (interval = "monthly") => {
  const response = await axios.get(`${API_URL}/payment-trends?interval=${interval}`);
  return response.data;
};

const getPaymentProgress = async () => {
  const response = await axios.get(`${API_URL}/payment-progress`);
  return response.data;
};

const getMonthlyLeadTrends = async () => {
  const response = await axios.get(`${API_URL}/monthly-lead-trends`);
  return response.data;
};

const getClosedLeadsByStaff = async () => {
  const response = await axios.get(`${API_URL}/closed-leads-by-staff`);
  return response.data;
};

const getCustomerStatusDistribution = async () => {
  const response = await axios.get(`${API_URL}/customer-status-distribution`);
  return response.data;
};

const getAllPaymentProgressDetails = async () => {
  const response = await axios.get(`${API_URL}/all-payment-progress-details`);
  return response.data;
};

export default {
  getLeadStatusDistribution,
  getLeadSourceDistribution,
  getPaymentStatusDistribution,
  getPaymentTrends,
  getPaymentProgress,
  getMonthlyLeadTrends,
  getClosedLeadsByStaff,
  getCustomerStatusDistribution,
  getAllPaymentProgressDetails,
};