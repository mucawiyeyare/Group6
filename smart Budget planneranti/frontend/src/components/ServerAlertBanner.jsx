export default function ServerAlertBanner({ alert, onClose }) {
  if (!alert) return null;

  const isOver = alert.type === "OVER" || alert.type === "LIMIT_100";
  return (
    <div className={`rounded-2xl p-4 border mb-4 ${isOver ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
      <div className={`font-semibold ${isOver ? "text-red-800" : "text-yellow-800"}`}>
        {isOver ? "Budget Alert" : "Budget Warning"}
      </div>
      <div className={`text-sm mt-1 ${isOver ? "text-red-700" : "text-yellow-700"}`}>
        {alert.message}
      </div>
      <div className="mt-3">
        <button onClick={onClose} className="text-sm px-3 py-1 rounded-xl border hover:bg-white">
          Close
        </button>
      </div>
    </div>
  );
}