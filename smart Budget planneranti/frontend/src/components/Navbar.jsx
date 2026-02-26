import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded " + (isActive ? "bg-black text-white" : "text-black");

  return (
    <div className="p-3 border-b flex items-center gap-2">
      <Link to="/" className="font-bold mr-4">Smart Budget</Link>

      <NavLink to="/" className={linkClass}>Dashboard</NavLink>
      <NavLink to="/income" className={linkClass}>Income</NavLink>
      <NavLink to="/expenses" className={linkClass}>Expenses</NavLink>
      <NavLink to="/reports" className={linkClass}>Reports</NavLink>

      <div className="ml-auto flex gap-2">
        <NavLink to="/login" className={linkClass}>Login</NavLink>
        <NavLink to="/register" className={linkClass}>Register</NavLink>
      </div>
    </div>
  );
}
