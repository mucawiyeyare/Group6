import { useEffect, useMemo, useState } from "react";
import IncomeForm from "../components/IncomeForm";
import IncomeTable from "../components/IncomeTable";
import { incomeAPI } from "../../api/income.js";
import { formatMoney } from "../utils/money";

export default function Income() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const total = useMemo(() => items.reduce((sum, x) => sum + Number(x.amount || 0), 0), [items]);
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
      const data = await incomeAPI.list();
      setItems(
        data.map((x) => ({
          ...x,
          date: x.date ? String(x.date).slice(0, 10) : "",
        }))
      );
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load income.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload) => {
    setError("");
    try {
      if (editing) {
        const updated = await incomeAPI.update(editing._id, payload);
        setItems((prev) =>
          prev.map((x) =>
            x._id === editing._id ? { ...updated, date: String(updated.date).slice(0, 10) } : x
          )
        );
        setEditing(null);
      } else {
        const created = await incomeAPI.create(payload);
        setItems((prev) => [{ ...created, date: String(created.date).slice(0, 10) }, ...prev]);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await incomeAPI.remove(id);
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
          <h1 className="text-2xl font-bold text-slate-900">Income</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all your income sources</p>
          {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}
        </div>

        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3">
            <div className="text-xs text-slate-400 font-medium">This Month</div>
            <div className="text-lg font-bold text-emerald-600">{formatMoney(monthTotal)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl px-5 py-3 shadow-lg">
            <div className="text-xs text-emerald-100 font-medium">All Time</div>
            <div className="text-lg font-bold text-white">{formatMoney(total)}</div>
          </div>
        </div>
      </div>

      <IncomeForm onSubmit={handleSubmit} editingItem={editing} onCancelEdit={() => setEditing(null)} />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
      ) : (
        <IncomeTable items={items} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}