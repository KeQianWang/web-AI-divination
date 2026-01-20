import { create } from 'zustand';
import { getRouteModule } from '../router/routes';

const DEFAULT_MODULE = 'home';

const useAppStore = create((set) => ({
  currentModule: DEFAULT_MODULE,
  showBack: false,
  syncRoute: (pathname) => {
    const nextModule = getRouteModule(pathname) || DEFAULT_MODULE;
    set({
      currentModule: nextModule,
      showBack: nextModule !== DEFAULT_MODULE
    });
  }
}));

export default useAppStore;
