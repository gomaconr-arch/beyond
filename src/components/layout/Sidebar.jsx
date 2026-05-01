import { Link, useLocation } from "react-router-dom";
import { Activity, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

function NavItem({ to, label, icon, isCollapsed, isMobile }) {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
        active ? "border border-blue-200 bg-blue-50 text-blue-700" : "border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100"
      } ${isMobile ? "justify-center" : ""}`}
      title={label}
    >
      {icon}
      {!isCollapsed && <span className="font-medium md:hidden lg:inline">{label}</span>}
    </Link>
  );
}

export default function Sidebar({ role, isCollapsed, onLogout }) {
  const nav = role === "admin"
    ? [
        { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
        { to: "/community", label: "Community", icon: <Users size={18} /> },
        { to: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
      ]
    : [
        { to: "/member/overview", label: "My Wellness", icon: <Activity size={18} /> },
        { to: "/community", label: "Community", icon: <Users size={18} /> },
      ];

  return (
    <>
      <aside className="hidden min-h-screen w-20 shrink-0 border-r border-slate-200 bg-white p-3 md:block lg:w-72 lg:p-4">
        <div className="mb-8 hidden lg:block">
          <h1 className="font-display text-xl font-semibold text-slate-900">Beyond Plus</h1>
          <p className="text-sm text-slate-500">Community Wellness Platform</p>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => (
            <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 transition hover:bg-red-100 lg:justify-start"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white p-2 md:hidden">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${nav.length + 1}, minmax(0, 1fr))` }}>
          {nav.map((item) => (
            <NavItem key={item.to} {...item} isMobile isCollapsed={false} />
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
    </>
  );
}
