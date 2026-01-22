import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import useAppStore from './store/useAppStore';
import useUserStore from './store/useUserStore';
import './App.less';

export default function App() {
  const location = useLocation();
  const syncRoute = useAppStore((state) => state.syncRoute);
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.user);
  const profileLoading = useUserStore((state) => state.profileLoading);
  const loadProfile = useUserStore((state) => state.loadProfile);

  useEffect(() => {
    syncRoute(location.pathname);
  }, [location.pathname, syncRoute]);

  useEffect(() => {
    if (!token || user || profileLoading) return;
    loadProfile().catch(() => {});
  }, [token, user, loadProfile, profileLoading]);

  return (
    <div className="app">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
