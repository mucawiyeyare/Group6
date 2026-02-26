import { api } from "./client";

export const budgetsAPI = {
  getByMonth: async (month) => (await api.get(`/budgets?month=${month}`)).data,
  upsert: async (payload) => (await api.post("/budgets", payload)).data,
};