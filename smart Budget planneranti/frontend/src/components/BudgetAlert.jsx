export default function BudgetAlert({ percent, limit, spent }) {
  if (limit <= 0) return null;

  if (percent < 80) return null;

  const isOver = percent >= 100;
  const title = isOver ? "Budget Limit Exceeded!" : "Budget Warning";
  const msg = isOver
    ? `You spent more than your monthly limit.`
    : `You have used ${percent}% of your monthly budget.`;

  return (
    <div className={`rounded-2xl p-4 border ${isOver ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
      <div className={`font-semibold ${isOver ? "text-red-800" : "text-yellow-800"}`}>{title}</div>
      <div className={`text-sm mt-1 ${isOver ? "text-red-700" : "text-yellow-700"}`}>{msg}</div>
      <div className="text-xs text-slate-600 mt-2">
        Spent: ${spent} / Limit: ${limit}
      </div>
    </div>
  );
}