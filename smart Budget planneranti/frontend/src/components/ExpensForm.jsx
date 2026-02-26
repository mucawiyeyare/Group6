import { useEffect, useState } from "react";

const empty = { amount: "", categoryId: "", paymentMethod: "Cash", date: "", note: "" };
const paymentMethods = ["Cash", "Card", "Transfer", "Mobile Money"];

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm placeholder-slate-400";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wide";

export default function ExpenseForm({ categories, onSubmit, editingItem, onCancelEdit }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingItem) {
      setForm({
        amount: String(editingItem.amount),
        categoryId: editingItem.categoryId,
        paymentMethod: editingItem.paymentMethod || "Cash",
        date: editingItem.date || "",
        note: editingItem.note || "",
      });
      setError("");
    } else {
      setForm(empty);
    }
  }, [editingItem]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) return setError("Amount must be > 0");
    if (!form.categoryId) return setError("Pick a category");
    if (!form.date) return setError("Pick a date");

    onSubmit({
      amount: amountNum,
      categoryId: form.categoryId,
      paymentMethod: form.paymentMethod,
      date: form.date,
      note: form.note.trim(),
    });

    if (!editingItem) setForm(empty);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${editingItem ? "bg-amber-50" : "bg-slate-50"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${editingItem ? "bg-amber-500" : "bg-rose-500"}`} />
          <span className="font-semibold text-slate-800">
            {editingItem ? "Editing Expense" : "Add New Expense"}
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

      <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className={labelCls}>Amount</label>
          <input
            name="amount"
            value={form.amount}
            onChange={change}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={change}
            className={inputCls}
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Payment</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={change}
            className={inputCls}
          >
            {paymentMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={change}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Note</label>
          <input
            name="note"
            value={form.note}
            onChange={change}
            placeholder="Optional note…"
            className={inputCls}
          />
        </div>

        <div className="md:col-span-5 flex items-center justify-between pt-1">
          {error ? (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
              <span>⚠</span> {error}
            </div>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5"
          >
            {editingItem ? "Save Changes" : "＋ Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}