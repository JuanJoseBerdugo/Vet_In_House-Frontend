import { useEffect, useState } from "react";
import { AuthPage } from "../features/auth/components/AuthPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { getStoredSession, saveSession, clearSession } from "../features/auth/session";
import { UNAUTHORIZED_EVENT } from "../lib/api/apiClient";
import type { AuthSession } from "../types/auth";
import "./App.css";

export function App() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      setSession(null);
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  function handleAuthenticated(nextSession: AuthSession) {
    saveSession(nextSession);
    setSession(nextSession);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <DashboardPage session={session} onLogout={handleLogout} />;
}
