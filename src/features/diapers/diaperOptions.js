export const POOP_COLORS = [
  { value: 'yellow', label: 'צהוב', swatch: '#E8C547' },
  { value: 'mustard', label: 'חרדל', swatch: '#C9A227' },
  { value: 'brown', label: 'חום', swatch: '#8B5A2B' },
  { value: 'green', label: 'ירוק', swatch: '#6B8E3D' },
  { value: 'black', label: 'שחור', swatch: '#2B2B2B', check: true },
  { value: 'red', label: 'אדום', swatch: '#C0392B', check: true },
  { value: 'white', label: 'לבן/אפור', swatch: '#D9D9D9', check: true },
];

export const POOP_TEXTURES = [
  { value: 'liquid', label: 'נוזלי' },
  { value: 'soft', label: 'רך' },
  { value: 'paste', label: 'דייסתי' },
  { value: 'hard', label: 'קשה' },
];

export const colorLabel = (v) => POOP_COLORS.find((c) => c.value === v)?.label;
export const textureLabel = (v) => POOP_TEXTURES.find((c) => c.value === v)?.label;

export function diaperTitle(d) {
  if (d.pee && d.poop) return 'פיפי + קקי';
  if (d.poop) return 'קקי';
  if (d.pee) return 'פיפי';
  return 'יבש';
}
