import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClientDetail from "./pages/AdminClientDetail";
import ClientHome from "./pages/ClientHome";
import CommunityPage from "./pages/CommunityPage";
import ClientProfile from "./pages/ClientProfile";
import AdminSettings from "./pages/AdminSettings";
import { useAuth } from "./hooks/useAuth";

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleGuard({ role, children }) {
  const { authUser } = useAuth();
  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== role) {
    return <Navigate to={authUser.role === "admin" ? "/admin/dashboard" : "/member/overview"} replace />;
  }
  return children;
}

function RootRedirect() {
  const { authUser } = useAuth();
  if (!authUser) return <Navigate to="/login" replace />;
  return <Navigate to={authUser.role === "admin" ? "/admin/dashboard" : "/member/overview"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard role="admin">
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/member/:clientId"
            element={
              <RoleGuard role="admin">
                <AdminClientDetail />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RoleGuard role="admin">
                <AdminSettings />
              </RoleGuard>
            }
          />
          <Route
            path="/member/overview"
            element={
              <RoleGuard role="client">
                <ClientHome />
              </RoleGuard>
            }
          />
          <Route path="/admin/client/:clientId" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/client/home" element={<Navigate to="/member/overview" replace />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/profile/:clientId" element={<ClientProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
