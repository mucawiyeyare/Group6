import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar />

        {/* This margin matches sidebar width (w-20 on mobile, w-64 on desktop) */}
        <div className="flex-1 ml-20 md:ml-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
