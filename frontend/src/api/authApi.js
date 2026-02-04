import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (credentials) => {
  try {
    console.log("Sending login request:", {
      username: credentials.username,
      role: credentials.role,
      password: "***hidden***"
    });

    const response = await axios.post(`${API_URL}/login`, {
      username: credentials.username,
      password: credentials.password,
      role: credentials.role
    });

    console.log("Login successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error("Invalid credentials. Please check your username and password.");
    } else if (error.message === "Network Error") {
      throw new Error("Cannot connect to server. Please ensure the backend is running.");
    } else {
      throw new Error("Login failed. Please try again.");
    }
  }
};

export const register = async (userData) => {
  try {
    console.log("Sending register request:", {
      username: userData.username,
      role: userData.role,
      password: "***hidden***"
    });

    const response = await axios.post(`${API_URL}/register`, {
      username: userData.username,
      password: userData.password,
      role: userData.role
    });

    console.log("✅ Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Registration error:", error.response?.data || error.message);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message === "Network Error") {
      throw new Error("Cannot connect to server. Please ensure the backend is running.");
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
};