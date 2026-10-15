// Greeting by time of day.
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 11) return 'בוקר טוב, הורים ☀️';
  if (h >= 11 && h < 17) return 'צהריים טובים 🍼';
  if (h >= 17 && h < 22) return 'ערב טוב 🌙';
  return 'לילה טוב, גיבורים 💪';
}
