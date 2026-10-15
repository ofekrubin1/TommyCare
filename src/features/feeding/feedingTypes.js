export const FEEDING_TYPES = {
  breast: { label: 'הנקה', short: 'הנקה' },
  formula: { label: 'תמ״ל', short: 'תמ״ל' },
  pumped: { label: 'בקבוק שאיבה', short: 'שאיבה' },
};

export const FEEDING_OPTIONS = Object.entries(FEEDING_TYPES).map(([value, t]) => ({ value, label: t.label }));

export const isBottle = (type) => type === 'formula' || type === 'pumped';

export const BREAST_SIDES = [
  { value: 'right', label: 'ימין' },
  { value: 'left', label: 'שמאל' },
];

export function sidesText(sides) {
  if (!sides?.length) return '';
  if (sides.length === 2) return 'ימין + שמאל';
  return sides[0] === 'right' ? 'ימין בלבד' : 'שמאל בלבד';
}
