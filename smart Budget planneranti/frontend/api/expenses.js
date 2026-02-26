import { api } from "./client";

export const expensesAPI = {
  list: async () => (await api.get("/expenses")).data,
  create: async (payload) => (await api.post("/expenses", payload)).data, // returns {expense, budgetResult}
  update: async (id, payload) => (await api.put(`/expenses/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/expenses/${id}`)).data,
};