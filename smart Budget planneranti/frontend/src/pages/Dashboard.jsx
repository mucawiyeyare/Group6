import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/Statcard";
import BudgetAlert from "../components/BudgetAlert";
import { incomeAPI } from "../../api/income";
import { expensesAPI } from "../../api/expenses";
import { categoriesAPI } from "../../api/categories";
import { budgetsAPI } from "../../api/budgets";
import { formatMoney } from "../utils/money";
import { useAuth } from "../context/useAuth";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function greet(name) {
  const h = new Date().getHours();
  const who = name ? `, ${name.split(" ")[0]}` : "";
  if (h < 12) return `Good morning${who} 🌤`;
  if (h < 18) return `Good afternoon${who} ☀️`;
  return `Good evening${who} 🌙`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month] = useState(currentMonth());
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const [inc, exp, cats, budget] = await Promise.all([
          incomeAPI.list(),
          expensesAPI.list(),
          categoriesAPI.list(),
          budgetsAPI.getByMonth(month),
        ]);
        setIncome(inc);
        setExpenses(exp);
        setCategories(cats);
        setMonthlyLimit(Number(budget?.totalLimit || 0));
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  const monthIncome = useMemo(
    () => income.filter((x) => String(x.date).slice(0, 7) === month),
    [income, month]
  );

  const monthExpenses = useMemo(
    () => expenses.filter((x) => String(x.date).slice(0, 7) === month),
    [expenses, month]
  );

  const totalIncome = useMemo(
    () => monthIncome.reduce((s, x) => s + Number(x.amount || 0), 0),
    [monthIncome]
  );

  const totalExpense = useMemo(
    () => monthExpenses.reduce((s, x) => s + Number(x.amount || 0), 0),
    [monthExpenses]
  );

  const balance = totalIncome - totalExpense;
  const percent = monthlyLimit > 0 ? Math.min(Math.round((totalExpense / monthlyLimit) * 100), 100) : 0;

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c._id] = c.name));
    return map;
  }, [categories]);

  const byCategory = useMemo(() => {
    const agg = {};
    for (const e of monthExpenses) {
      const cid = e.categoryId?._id || e.categoryId;
      agg[cid] = (agg[cid] || 0) + Number(e.amount || 0);
    }
    return Object.entries(agg).map(([cid, value]) => ({
      name: categoryMap[cid] || "Unknown",
      value,
    }));
  }, [monthExpenses, categoryMap]);

  const recent = useMemo(
    () =>
      [...monthExpenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .map((e) => ({
          ...e,
          date: String(e.date).slice(0, 10),
          categoryName: categoryMap[e.categoryId?._id || e.categoryId] || "Unknown",
        })),
    [monthExpenses, categoryMap]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <div className="text-sm text-slate-500">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greet(user?.name)}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's your financial overview for{" "}
            <span className="font-semibold text-slate-700">{month}</span>
          </p>
          {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}
        </div>

        {/* Budget pill */}
        {monthlyLimit > 0 && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3 flex flex-col items-end">
            <div className="text-xs text-slate-400 font-medium">Monthly Budget</div>
            <div className="text-lg font-bold text-slate-900">{formatMoney(monthlyLimit)}</div>
            <div className={`text-xs font-semibold mt-0.5 ${percent >= 100 ? "text-rose-600" : percent >= 80 ? "text-amber-600" : "text-emerald-600"}`}>
              {percent}% used
            </div>
          </div>
        )}
      </div>

      {/* Budget Alert */}
      <BudgetAlert percent={percent} limit={monthlyLimit} spent={totalExpense} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          color="green"
          title="Income (This Month)"
          value={formatMoney(totalIncome)}
          subtitle={`${monthIncome.length} transaction${monthIncome.length !== 1 ? "s" : ""}`}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        />
        <StatCard
          color="red"
          title="Expenses (This Month)"
          value={formatMoney(totalExpense)}
          subtitle={`${monthExpenses.length} transaction${monthExpenses.length !== 1 ? "s" : ""}`}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
        />
        <StatCard
          color={balance >= 0 ? "blue" : "purple"}
          title="Net Balance"
          value={formatMoney(balance)}
          subtitle={balance >= 0 ? "You're in the green 👍" : "Spending exceeds income"}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Budget Progress Bar */}
      {monthlyLimit > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Budget Usage</div>
            <div className={`text-sm font-bold ${percent >= 100 ? "text-rose-600" : percent >= 80 ? "text-amber-600" : "text-emerald-600"}`}>
              {percent}%
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                percent >= 100
                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                  : percent >= 80
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-emerald-400 to-teal-500"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{formatMoney(totalExpense)} spent</span>
            <span>{formatMoney(monthlyLimit)} limit</span>
          </div>
        </div>
      )}

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Charts */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="font-semibold text-slate-800 mb-1">Category Split</div>
            <div className="text-xs text-slate-400 mb-3">Expenses by category</div>
            {byCategory.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="font-semibold text-slate-800 mb-1">Spending by Category</div>
            <div className="text-xs text-slate-400 mb-3">Bar chart view</div>
            {byCategory.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-semibold text-slate-800">Recent Expenses</div>
            <div className="text-xs text-slate-400 mt-0.5">Latest {recent.length} transactions</div>
          </div>
          <div className="p-4 space-y-2">
            {recent.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">No expenses this month.</div>
            ) : (
              recent.map((e, i) => (
                <div key={e._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    >
                      {e.categoryName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{e.categoryName}</div>
                      <div className="text-xs text-slate-400">{e.date} · {e.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-rose-600">{formatMoney(e.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
