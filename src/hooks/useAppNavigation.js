import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router/routes';

const routeEntries = Object.entries(ROUTES);

export default function useAppNavigation() {
  const navigate = useNavigate();

  const goTo = useCallback(
    (keyOrPath) => {
      const match = routeEntries.find(([key, value]) =>
        keyOrPath === key ? true : value.path === keyOrPath
      );
      if (!match) return;
      const [, route] = match;
      navigate(route.path);
    },
    [navigate]
  );

  const goHome = useCallback(() => {
    navigate(ROUTES.home.path);
  }, [navigate]);

  return { goTo, goHome };
}
