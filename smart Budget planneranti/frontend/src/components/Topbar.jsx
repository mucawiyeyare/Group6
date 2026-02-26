import { useAuth } from "../context/useAuth";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="text-sm text-slate-500">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-xs text-slate-400 capitalize">{user.role}</div>
          </div>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name} avatar`}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
