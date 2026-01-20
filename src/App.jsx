import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import useAppStore from './store/useAppStore';
import useUserStore from './store/useUserStore';

export default function App() {
  const location = useLocation();
  const syncRoute = useAppStore((state) => state.syncRoute);
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.user);
  const loadProfile = useUserStore((state) => state.loadProfile);

  useEffect(() => {
    syncRoute(location.pathname);
  }, [location.pathname, syncRoute]);

  useEffect(() => {
    if (!token || user) return;
    loadProfile().catch(() => {});
  }, [token, user, loadProfile]);

  return (
    <div className="app">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
