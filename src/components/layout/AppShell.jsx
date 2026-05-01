import { Outlet, useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { initials, nameColor } from "../../data/clientMetrics";

export default function AppShell() {
  const navigate = useNavigate();
  const { authUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ui-base text-slate-900">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar role={authUser?.role} onLogout={handleLogout} />
        <main className="w-full pb-20 md:pb-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-brand-primary" />
              <h2 className="font-display text-lg font-semibold text-slate-900">Beyond+</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${nameColor(authUser?.name || "U")}`}>
                {initials(authUser?.name || "User")}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{authUser?.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{authUser?.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 text-sm font-medium text-brand-primary transition hover:text-blue-800"
              >
                Sign Out
              </button>
            </div>
          </header>
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
