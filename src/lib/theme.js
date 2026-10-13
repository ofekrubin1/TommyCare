// 'auto' follows the phone's dark mode; the choice is per device.
const KEY = 'tommycare:theme';

export const getTheme = () => { try { return localStorage.getItem(KEY) || 'auto'; } catch { return 'auto'; } };

export function applyTheme(theme = getTheme()) {
  const dark = theme === 'dark' || (theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  applyTheme(theme);
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme());
