import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, {
    username: data.username,
    password: data.password,
    role: data.role.toUpperCase(),
  });
  return res.data;
};

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, {
    username: data.username,
    password: data.password,
    role: data.role.toUpperCase(),
    adminKey: data.adminKey || null,
    designation: data.designation || "ADMIN",
  });
  return res.data;
};
