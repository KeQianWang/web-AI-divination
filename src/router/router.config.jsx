import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import AuthPage from '../components/AuthPage';
import HomePage from '../pages/HomePage';
import DailyPage from '../pages/DailyPage';
import BaziPage from '../pages/BaziPage';
import DreamPage from '../pages/DreamPage';
import ChatPage from '../pages/ChatPage';
import RequireAuth from './RequireAuth';
import { ROUTES } from './routes';

const router = createBrowserRouter([
  {
    path: ROUTES.login.path,
    element: <AuthPage />
  },
  {
    path: ROUTES.home.path,
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: ROUTES.daily.path.slice(1),
        element: <DailyPage />
      },
      {
        path: ROUTES.bazi.path.slice(1),
        element: <BaziPage />
      },
      {
        path: ROUTES.dream.path.slice(1),
        element: <DreamPage />
      },
      {
        path: ROUTES.chat.path.slice(1),
        element: <ChatPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.home.path} replace />
  }
]);

export default router;
