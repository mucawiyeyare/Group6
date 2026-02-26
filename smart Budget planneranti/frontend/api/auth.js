import { api } from "./client";

export const authAPI = {
  register: async (payload) => (await api.post("/auth/register", payload)).data,
  login: async (payload) => (await api.post("/auth/login", payload)).data,
  me: async () => (await api.get("/auth/me")).data,
  updateMe: async (payload) => (await api.put("/auth/me", payload)).data,
};

export const usersAPI = {
  create: async (payload) => (await api.post("/users", payload)).data,
  list: async () => (await api.get("/users")).data,
  update: async (id, payload) => (await api.put(`/users/${id}`, payload)).data,
  updateRole: async (id, role) => (await api.put(`/users/${id}/role`, { role })).data,
  delete: async (id) => (await api.delete(`/users/${id}`)).data,
};
