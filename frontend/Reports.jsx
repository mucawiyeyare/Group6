import { useEffect, useMemo, useState } from "react";
import { incomeAPI } from "../../api/income";
import { expensesAPI } from "../../api/expenses";
import { categoriesAPI } from "../../api/categories";
import { formatMoney } from "../utils/money";

const ACCENT_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [inc, exp, cats] = await Promise.all([
        incomeAPI.list(),
        expensesAPI.list(),
        categoriesAPI.list(),
      ]);
      setIncome(inc);
      setExpenses(exp);
      setCategories(cats);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoriesById = useMemo(() => {
    const m = {};
    for (const c of categories) m[c._id] = c.name;
    return m;
  }, [categories]);

  const monthIncomes = useMemo(
    () => income.filter((x) => String(x.date).slice(0, 7) === month),
    [income, month]
  );

  const monthExpenses = useMemo(
    () => expenses.filter((x) => String(x.date).slice(0, 7) === month),
    [expenses, month]
  );

  const totalIncome = useMemo(
    () => monthIncomes.reduce((s, x) => s + Number(x.amount || 0), 0),
    [monthIncomes]
  );

  const totalExpense = useMemo(
    () => monthExpenses.reduce((s, x) => s + Number(x.amount || 0), 0),
    [monthExpenses]
  );

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const byCategory = useMemo(() => {
    const agg = {};
    for (const e of monthExpenses) {
      const cid = e.categoryId?._id || e.categoryId;
      agg[cid] = (agg[cid] || 0) + Number(e.amount || 0);
    }
    return Object.entries(agg)
      .map(([cid, amount]) => ({
        category: categoriesById[cid] || "Unknown",
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, categoriesById]);

  const top5 = useMemo(
    () => [...monthExpenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [monthExpenses]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <div className="text-sm text-slate-500">Loading reports…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monthly Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial summary for the selected month</p>
          {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3">
          <label className="text-xs text-slate-400 font-medium block mb-1">Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-3">Total Income</div>
          <div className="text-3xl font-bold">{formatMoney(totalIncome)}</div>
          <div className="text-xs text-emerald-100 mt-2">{monthIncomes.length} transactions</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="text-xs font-semibold text-rose-100 uppercase tracking-wider mb-3">Total Expenses</div>
          <div className="text-3xl font-bold">{formatMoney(totalExpense)}</div>
          <div className="text-xs text-rose-100 mt-2">{monthExpenses.length} transactions</div>
        </div>
        <div className={`bg-gradient-to-br ${balance >= 0 ? "from-blue-500 to-indigo-600" : "from-violet-500 to-purple-600"} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-3">Net Balance</div>
          <div className="text-3xl font-bold">{formatMoney(balance)}</div>
          <div className="text-xs text-blue-100 mt-2">
            {totalIncome > 0 ? `Savings rate: ${savingsRate}%` : "No income recorded"}
          </div>
        </div>
      </div>

      {/* Category Breakdown + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category with progress bars */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-semibold text-slate-800">Spending by Category</div>
            <div className="text-xs text-slate-400 mt-0.5">As % of total expenses</div>
          </div>
          <div className="p-5 space-y-4">
            {byCategory.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">No expenses for this month.</div>
            ) : (
              byCategory.map((x, i) => {
                const pct = totalExpense > 0 ? Math.round((x.amount / totalExpense) * 100) : 0;
                return (
                  <div key={x.category}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-700">{x.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatMoney(x.amount)}</span>
                        <span className="text-xs text-slate-400">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-semibold text-slate-800">Top 5 Expenses</div>
            <div className="text-xs text-slate-400 mt-0.5">Highest single transactions</div>
          </div>
          <div className="p-5 space-y-3">
            {top5.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">No expenses for this month.</div>
            ) : (
              top5.map((e, i) => (
                <div key={e._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">
                      {categoriesById[e.categoryId?._id || e.categoryId] || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {String(e.date).slice(0, 10)} · {e.paymentMethod}
                    </div>
                    {e.note && <div className="text-xs text-slate-400 truncate">{e.note}</div>}
                  </div>
                  <div className="text-sm font-bold text-rose-600 whitespace-nowrap">
                    {formatMoney(e.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Income breakdown */}
      {monthIncomes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-semibold text-slate-800">Income Sources</div>
            <div className="text-xs text-slate-400 mt-0.5">{month}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthIncomes.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5 text-slate-600">{String(i.date).slice(0, 10)}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        {i.source}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs">{i.note || "—"}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                      {formatMoney(i.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}