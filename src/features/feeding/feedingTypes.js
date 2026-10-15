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

// Both sides is the normal case, so only a one-sided feeding gets a label.
export function sidesText(sides) {
  if (sides?.length !== 1) return '';
  return sides[0] === 'right' ? 'ימין בלבד' : 'שמאל בלבד';
}
