import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

const userLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    to: "/income",
    label: "Income",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A8 8 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const adminUsersLink = {
  to: "/admin/users",
  label: "Users",
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
};

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center justify-center md:justify-start gap-0 md:gap-3 px-2 md:px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white/20 text-white shadow-[0_10px_28px_rgba(59,130,246,0.45)] ring-1 ring-white/25"
            : "text-blue-100/90 hover:bg-white/10 hover:text-white md:hover:translate-x-1"
        }`
      }
      title={label}
    >
      {({ isActive }) => (
        <>
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-white/5 text-blue-100 group-hover:bg-white/15 group-hover:text-white"
            }`}
          >
            {icon}
          </span>
          <span className="hidden md:block font-medium text-sm tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="w-20 md:w-64 flex flex-col fixed left-0 top-0 h-screen z-40 overflow-hidden border-r border-blue-300/25 bg-gradient-to-b from-[#0d3d84] via-[#0c2e63] to-[#061836] shadow-[0_30px_70px_rgba(30,64,175,0.55)]">
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-56 h-56 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 w-40 h-40 rounded-full bg-cyan-400/25 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="p-3 md:p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-bold text-white tracking-wide">Smart Budget</div>
              <div className="text-xs text-blue-100/85">Planner</div>
            </div>
          </div>
        </div>

        <nav className="p-2 md:p-4 flex-1 space-y-1 overflow-y-hidden">
          {userLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}

          {user?.role === "admin" && <NavItem {...adminUsersLink} />}
        </nav>

        <div className="p-2 md:p-4 border-t border-white/10 bg-black/15 backdrop-blur-sm">
          {user && (
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-2 md:p-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.name} avatar`}
                  className="w-9 h-9 rounded-full object-cover border border-white/30 flex-shrink-0 shadow-md shadow-blue-900/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-blue-900/40">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden md:block flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                      user.role === "admin"
                        ? "bg-blue-500/25 text-white"
                        : "bg-sky-500/25 text-white"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-2 px-2 md:px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
