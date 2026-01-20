import React from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { ROUTES } from './routes';

export default function RequireAuth({ children }) {
  const token = useUserStore((state) => state.token);

  if (!token) {
    return <Navigate to={ROUTES.login.path} replace />;
  }

  return children;
}
