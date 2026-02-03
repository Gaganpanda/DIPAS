import api from "./api";

export const getNotices = async () => {
  const res = await api.get("/api/notices");
  return res.data;
};

export const addNotice = async (notice) => {
  const res = await api.post("/api/notices", notice);
  return res.data;
};
