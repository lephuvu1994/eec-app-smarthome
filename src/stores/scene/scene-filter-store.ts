import { create } from 'zustand';

type SceneFilterState = {
  activeTapToRunFilters: Set<string>;
  activeAutomationFilters: Set<string>;
};

type SceneFilterActions = {
  toggleTapToRunFilter: (filterId: string) => void;
  toggleAutomationFilter: (filterId: string) => void;
};

export const useSceneFilterStore = create<SceneFilterState & SceneFilterActions>(set => ({
  activeTapToRunFilters: new Set(),
  activeAutomationFilters: new Set(),

  toggleTapToRunFilter: (filterId: string) =>
    set((state) => {
      const next = new Set(state.activeTapToRunFilters);
      if (next.has(filterId)) {
        next.delete(filterId);
      }
      else {
        next.add(filterId);
      }
      return { activeTapToRunFilters: next };
    }),

  toggleAutomationFilter: (filterId: string) =>
    set((state) => {
      const next = new Set(state.activeAutomationFilters);
      if (next.has(filterId)) {
        next.delete(filterId);
      }
      else {
        next.add(filterId);
      }
      return { activeAutomationFilters: next };
    }),
}));
