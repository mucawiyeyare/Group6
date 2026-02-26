import { useEffect, useMemo, useState } from "react";
import ExpenseForm from "../components/ExpensForm";
import ExpenseTable from "../components/ExpenseTable";
import ServerAlertBanner from "../components/ServerAlertBanner";
import { expensesAPI } from "../../api/expenses";
import { categoriesAPI } from "../../api/categories";
import { formatMoney } from "../utils/money";

export default function Expenses() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverAlert, setServerAlert] = useState(null);

  const categoriesById = useMemo(() => {
    const map = {};
    for (const c of categories) map[c._id] = c.name;
    return map;
  }, [categories]);

  const total = useMemo(() => items.reduce((s, x) => s + Number(x.amount || 0), 0), [items]);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = useMemo(
    () =>
      items
        .filter((x) => String(x.date).slice(0, 7) === thisMonth)
        .reduce((s, x) => s + Number(x.amount || 0), 0),
    [items, thisMonth]
  );

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [cats, exps] = await Promise.all([categoriesAPI.list(), expensesAPI.list()]);
      setCategories(cats);
      setItems(
        exps.map((x) => ({
          ...x,
          categoryId: x.categoryId?._id || x.categoryId,
          date: x.date ? String(x.date).slice(0, 10) : "",
        }))
      );
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load expenses/categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (payload) => {
    setError("");
    setServerAlert(null);
    try {
      if (editing) {
        const res = await expensesAPI.update(editing._id, payload);
        const updated = res.expense;
        setItems((prev) =>
          prev.map((x) =>
            x._id === editing._id
              ? { ...updated, categoryId: updated.categoryId?._id || updated.categoryId, date: String(updated.date).slice(0, 10) }
              : x
          )
        );
        setEditing(null);
        if (res.budgetResult?.alert) setServerAlert(res.budgetResult.alert);
      } else {
        const res = await expensesAPI.create(payload);
        const created = res.expense;
        setItems((prev) => [
          { ...created, categoryId: created.categoryId?._id || created.categoryId, date: String(created.date).slice(0, 10) },
          ...prev,
        ]);
        if (res.budgetResult?.alert) setServerAlert(res.budgetResult.alert);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Save failed.");
    }
  };

  const onDelete = async (id) => {
    setError("");
    try {
      await expensesAPI.remove(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
      if (editing && editing._id === id) setEditing(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-0.5">Log and manage your spending</p>
          {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}
        </div>

        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3">
            <div className="text-xs text-slate-400 font-medium">This Month</div>
            <div className="text-lg font-bold text-rose-600">{formatMoney(monthTotal)}</div>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl px-5 py-3 shadow-lg">
            <div className="text-xs text-rose-100 font-medium">All Time</div>
            <div className="text-lg font-bold text-white">{formatMoney(total)}</div>
          </div>
        </div>
      </div>

      <ServerAlertBanner alert={serverAlert} onClose={() => setServerAlert(null)} />

      {categories.length === 0 && !loading && (
        <div className="rounded-2xl p-4 border bg-amber-50 border-amber-200 text-sm text-amber-800 flex items-center gap-2">
          <span>⚠️</span> No categories found. Add categories in <strong>Settings</strong> first.
        </div>
      )}

      <ExpenseForm
        categories={categories}
        onSubmit={onSubmit}
        editingItem={editing}
        onCancelEdit={() => setEditing(null)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        </div>
      ) : (
        <ExpenseTable items={items} categoriesById={categoriesById} onEdit={setEditing} onDelete={onDelete} />
      )}
    </div>
  );
}