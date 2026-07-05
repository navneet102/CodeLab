import { create } from 'zustand';
import { DEFAULT_LANGUAGE } from '../utils/languages';
import { DEFAULT_THEME } from '../utils/themes';

const useEditorStore = create((set) => ({
  language: DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
  fontSize: 14,

  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
}));

export default useEditorStore;
