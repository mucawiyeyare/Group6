import { api } from "./client";

export const incomeAPI = {
  list: async () => (await api.get("/income")).data,
  create: async (payload) => (await api.post("/income", payload)).data,
  update: async (id, payload) => (await api.put(`/income/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/income/${id}`)).data,
};