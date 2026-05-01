import { useMemo } from "react";
import { useAppStore } from "../store/appStore";

export function useAuth() {
  const authUser = useAppStore((s) => s.authUser);
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);

  return useMemo(
    () => ({
      authUser,
      login,
      logout,
      isAuthenticated: Boolean(authUser),
      isAdmin: authUser?.role === "admin",
      isClient: authUser?.role === "client",
    }),
    [authUser, login, logout],
  );
}
