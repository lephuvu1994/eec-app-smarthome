import en from '@/translations/en.json';
import vi from '@/translations/vi.json';

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: vi,
  },
};

export type Language = keyof typeof resources;
