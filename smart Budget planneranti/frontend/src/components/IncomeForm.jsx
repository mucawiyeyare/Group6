import { useEffect, useState } from "react";

const emptyForm = { amount: "", source: "", date: "", note: "" };

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm placeholder-slate-400";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wide";

export default function IncomeForm({ onSubmit, editingItem, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingItem) {
      setForm({
        amount: String(editingItem.amount),
        source: editingItem.source || "",
        date: editingItem.date || "",
        note: editingItem.note || "",
      });
      setError("");
    } else {
      setForm(emptyForm);
    }
  }, [editingItem]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const amountNum = Number(form.amount);

    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      return setError("Amount must be a number greater than 0.");
    }
    if (!form.source.trim()) return setError("Source is required.");
    if (!form.date) return setError("Date is required.");

    onSubmit({
      amount: amountNum,
      source: form.source.trim(),
      date: form.date,
      note: form.note.trim(),
    });

    if (!editingItem) setForm(emptyForm);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${editingItem ? "bg-amber-50" : "bg-slate-50"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${editingItem ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className="font-semibold text-slate-800">
            {editingItem ? "Editing Income" : "Add New Income"}
          </span>
        </div>
        {editingItem && (
          <button
            onClick={onCancelEdit}
            className="text-sm px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Amount</label>
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Source</label>
          <input
            name="source"
            value={form.source}
            onChange={handleChange}
            placeholder="Salary, Freelance, Gift…"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Note (optional)</label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Short note…"
            className={inputCls}
          />
        </div>

        <div className="md:col-span-4 flex items-center justify-between pt-1">
          {error ? (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
              <span>⚠</span> {error}
            </div>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
          >
            {editingItem ? "Save Changes" : "＋ Add Income"}
          </button>
        </div>
      </form>
    </div>
  );
}