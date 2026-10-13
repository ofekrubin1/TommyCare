export const FEEDING_TYPES = {
  breast: { label: 'הנקה', short: 'הנקה' },
  formula: { label: 'תמ״ל', short: 'תמ״ל' },
  pumped: { label: 'בקבוק שאיבה', short: 'שאיבה' },
};

export const FEEDING_OPTIONS = Object.entries(FEEDING_TYPES).map(([value, t]) => ({ value, label: t.label }));

export const isBottle = (type) => type === 'formula' || type === 'pumped';
