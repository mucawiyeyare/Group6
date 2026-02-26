import { api } from "./client";

export const categoriesAPI = {
  list: async () => (await api.get("/categories")).data,
  create: async (payload) => (await api.post("/categories", payload)).data,
  remove: async (id) => (await api.delete(`/categories/${id}`)).data,
};