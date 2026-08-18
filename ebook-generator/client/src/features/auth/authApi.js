import api from "../../services/api.js";

const register = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

const login = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
