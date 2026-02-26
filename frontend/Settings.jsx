import { useEffect, useMemo, useState } from "react";
import { categoriesAPI } from "../../api/categories";
import { budgetsAPI } from "../../api/budgets";
import { formatMoney } from "../utils/money";

function currentMonth() {
  const d = new Date();
  return d.toISOString().slice(0, 7);
}

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wide";

export default function Settings() {
  const [currency, setCurrency] = useState("USD");
  const [month, setMonth] = useState(currentMonth());

  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [categoryLimits, setCategoryLimits] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [addingCat, setAddingCat] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const categoriesById = useMemo(() => {
    const m = {};
    for (const c of categories) m[c._id] = c.name;
    return m;
  }, [categories]);

  const load = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const [cats, budget] = await Promise.all([
        categoriesAPI.list(),
        budgetsAPI.getByMonth(month),
      ]);

      setCategories(cats);

      if (budget) {
        setMonthlyLimit(Number(budget.totalLimit || 0));
        setCategoryLimits(
          (budget.categoryLimits || []).map((x) => ({
            categoryId: x.categoryId?._id || x.categoryId,
            limit: Number(x.limit || 0),
          }))
        );
      } else {
        setMonthlyLimit(0);
        setCategoryLimits([]);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const addCategory = async () => {
    setError("");
    setSuccessMsg("");
    const name = newCat.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      const created = await categoriesAPI.create({ name });
      setCategories((prev) => [created, ...prev]);
      setNewCat("");
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to add category.");
    } finally {
      setAddingCat(false);
    }
  };

  const deleteCategory = async (id) => {
    setError("");
    setSuccessMsg("");
    try {
      await categoriesAPI.remove(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setCategoryLimits((prev) => prev.filter((x) => x.categoryId !== id));
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to delete category.");
    }
  };

  const setCatLimit = (categoryId, val) => {
    const num = Number(val);
    setCategoryLimits((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x.categoryId === categoryId);
      const payload = { categoryId, limit: Number.isNaN(num) ? 0 : num };
      if (idx === -1) next.push(payload);
      else next[idx] = payload;
      return next;
    });
  };

  const saveBudget = async () => {
    setError("");
    setSuccessMsg("");
    setSavingBudget(true);
    try {
      const payload = {
        month,
        totalLimit: Number(monthlyLimit || 0),
        categoryLimits: categoryLimits
          .filter((x) => x.limit !== "" && Number(x.limit) >= 0)
          .map((x) => ({ categoryId: x.categoryId, limit: Number(x.limit || 0) })),
      };
      await budgetsAPI.upsert(payload);
      setSuccessMsg("Budget saved successfully!");
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to save budget.");
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <div className="text-sm text-slate-500">Loading settings…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage categories and budget limits</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3">
          <label className="text-xs text-slate-400 font-medium block mb-1">Budget Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="rounded-xl px-4 py-3 bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl px-4 py-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      {/* General Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="font-semibold text-slate-800">General</div>
          <div className="text-xs text-slate-400 mt-0.5">Currency preference and monthly budget limit</div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Currency (UI only)</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
              >
                <option>USD</option>
                <option>EUR</option>
                <option>SOS</option>
                <option>KES</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Monthly Budget Limit</label>
              <input
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(Number(e.target.value || 0))}
                className={inputCls}
                type="number"
                min="0"
                placeholder="e.g. 2000"
              />
              <div className="text-xs text-slate-400 mt-1">Alerts trigger at 80% and 100%.</div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 flex flex-col justify-center">
              <div className="text-xs text-indigo-400 font-medium mb-1">Preview</div>
              <div className="text-xl font-bold text-indigo-700">{formatMoney(monthlyLimit)}</div>
              <div className="text-xs text-indigo-400 mt-1">per month limit</div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveBudget}
              disabled={savingBudget}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingBudget ? "Saving…" : "Save Budget"}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-800">Expense Categories</div>
            <div className="text-xs text-slate-400 mt-0.5">{categories.length} categories</div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Add category */}
          <div className="flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New category name…"
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={addCategory}
              disabled={addingCat || !newCat.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {addingCat ? "Adding…" : "＋ Add"}
            </button>
          </div>

          {/* Table */}
          {categories.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-3xl mb-2">🗂️</div>
              <div className="text-slate-500 text-sm">No categories yet. Add one above.</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Budget Limit (optional)</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.map((c) => {
                    const found = categoryLimits.find((x) => x.categoryId === c._id);
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                            {categoriesById[c._id]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={found?.limit ?? ""}
                            onChange={(e) => setCatLimit(c._id, e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm w-36 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="No limit"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteCategory(c._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={saveBudget}
              disabled={savingBudget}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingBudget ? "Saving…" : "Save Budget"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}