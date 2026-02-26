const colorMap = {
  green: {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    icon: "bg-white/20",
    text: "text-emerald-100",
    badge: "bg-white/20 text-white",
  },
  red: {
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    icon: "bg-white/20",
    text: "text-rose-100",
    badge: "bg-white/20 text-white",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    icon: "bg-white/20",
    text: "text-blue-100",
    badge: "bg-white/20 text-white",
  },
  purple: {
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    icon: "bg-white/20",
    text: "text-violet-100",
    badge: "bg-white/20 text-white",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    icon: "bg-white/20",
    text: "text-slate-200",
    badge: "bg-white/20 text-white",
  },
};

export default function StatCard({ title, value, subtitle, color = "blue", icon }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`${c.bg} rounded-2xl p-5 shadow-lg text-white relative overflow-hidden`}>
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
            {title}
          </div>
          {icon && (
            <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center`}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <div className={`text-xs mt-2 ${c.text}`}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}