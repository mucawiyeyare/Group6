import { useMemo, useState } from "react";
import { formatMoney } from "../utils/money";

const sourceStyles = [
  "bg-emerald-50 text-emerald-700",
  "bg-sky-50 text-sky-700",
  "bg-indigo-50 text-indigo-700",
  "bg-teal-50 text-teal-700",
];

const pickSourceStyle = (source) => {
  const value = String(source || "");
  const code = value.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return sourceStyles[code % sourceStyles.length];
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export default function IncomeTable({ items, onEdit, onDelete }) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const source = String(item.source || "").toLowerCase();
      const note = String(item.note || "").toLowerCase();
      const date = String(item.date || "").toLowerCase();
      const amount = String(item.amount ?? "").toLowerCase();
      return source.includes(q) || note.includes(q) || date.includes(q) || amount.includes(q);
    });
  }, [items, query]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="font-semibold text-slate-700">No income records yet</div>
        <div className="text-sm text-slate-400 mt-1">Add your first income entry above.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/60 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-slate-800">Income Records</div>
          <div className="text-xs text-slate-500 mt-0.5">Browse and manage incoming cash flow</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search income..."
              className="w-56 pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2">
            {filteredItems.length}/{items.length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
            <tr className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3">Note</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item._id} className="odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/40 transition-colors">
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${pickSourceStyle(
                        item.source
                      )}`}
                    >
                      {item.source}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-emerald-700">
                    {formatMoney(item.amount)}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 max-w-[280px] truncate" title={item.note || "-"}>
                    {item.note || "-"}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                  No income records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
