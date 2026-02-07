import axios from "axios";

const API = "http://localhost:8080/api/director";

export const getPendingEmployees = async () => {
  const res = await axios.get(`${API}/pending`);
  return res.data;
};

export const approveEmployee = async (id) => {
  await axios.put(`${API}/approve/${id}`);
};
