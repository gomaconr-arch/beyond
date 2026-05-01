import { useMemo, useState } from "react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAppStore } from "../store/appStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const users = useAppStore((s) => s.users);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const credentials = useMemo(() => users.map((u) => ({ username: u.username, password: u.password, role: u.role })), [users]);

  const submit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin/dashboard" : "/member/overview");
  };

  return (
    <div className="min-h-screen bg-ui-subtle px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-center">
          <h1 className="font-display text-5xl font-semibold text-slate-900">Beyond+</h1>
          <p className="mt-2 text-lg text-slate-600">Beyond+</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={submit}
            className="card-surface border-t-4 border-t-brand-primary p-8"
          >
            <h2 className="font-display text-2xl font-semibold text-slate-900">Member Sign In</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-blue-100"
                />
              </label>
              {error && <p className="text-sm font-medium text-red-600">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white transition hover:bg-blue-800"
              >
                Login
              </button>
            </div>
          </form>

          <section className="card-surface p-6">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <span>Demo Credentials</span>
              {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {open && (
              <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-300">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-900">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2 text-left">Username</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left">Password</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left">Role</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((c) => (
                      <tr key={`${c.username}-${c.password}`} className="border-b border-slate-200">
                        <td className="font-data px-3 py-2 text-slate-700">{c.username}</td>
                        <td className="font-data px-3 py-2 text-slate-700">{c.password}</td>
                        <td className="px-3 py-2 text-xs font-semibold uppercase text-slate-600">{c.role}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(`${c.username} / ${c.password}`)}
                            className="rounded-md border border-slate-300 p-1.5 text-slate-600 transition hover:bg-slate-200"
                          >
                            <Copy size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
