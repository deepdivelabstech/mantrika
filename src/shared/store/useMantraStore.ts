import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BUNDLED_CATALOG, loadMantraCatalog } from '@/shared/data/mantraCatalog';
import type { CustomMantra, Mantra } from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

type MantraStore = {
  catalog: Mantra[];
  catalogStatus: 'idle' | 'loading' | 'ready' | 'error';
  custom: CustomMantra[];
  loadCatalog: () => Promise<void>;
  addCustomMantra: (text: string) => CustomMantra;
  removeCustomMantra: (id: string) => void;
};

export const useMantraStore = create<MantraStore>()(
  persist(
    (set, get) => ({
      catalog: BUNDLED_CATALOG,
      catalogStatus: 'idle',
      custom: [],
      loadCatalog: async () => {
        if (get().catalogStatus === 'loading') return;
        set({ catalogStatus: 'loading' });
        try {
          const catalog = await loadMantraCatalog();
          set({ catalog, catalogStatus: 'ready' });
        } catch {
          set({ catalogStatus: 'error' });
        }
      },
      addCustomMantra: (text) => {
        const trimmed = text.trim();
        const entry: CustomMantra = {
          id: `custom-${Date.now()}`,
          text: trimmed,
          createdAt: new Date().toISOString(),
        };
        set({ custom: [...get().custom, entry] });
        return entry;
      },
      removeCustomMantra: (id) => set({ custom: get().custom.filter((m) => m.id !== id) }),
    }),
    {
      name: 'mantrika.mantras.v1',
      storage: asyncStorageAdapter,
      // Catalog is re-fetched/re-seeded each launch; only user-authored custom mantras persist.
      partialize: (state) => ({ custom: state.custom }),
    },
  ),
);

export function customToMantra(c: CustomMantra, customLabel: string): Mantra {
  return { id: c.id, name: c.text, deva: customLabel, chant: c.text };
}
