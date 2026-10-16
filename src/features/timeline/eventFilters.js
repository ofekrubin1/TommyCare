// Record-type filters for the journal (both the global one on top and the one inside a day).
export const EVENT_FILTERS = [
  { value: 'all', label: 'הכל', match: () => true },
  { value: 'feeding', label: 'האכלות', match: (e) => e.kind === 'feeding' },
  { value: 'breast', label: 'הנקה', match: (e) => e.kind === 'feeding' && e.record.type === 'breast' },
  { value: 'formula', label: 'תמ״ל', match: (e) => e.kind === 'feeding' && e.record.type === 'formula' },
  { value: 'pumped', label: 'בקבוק שאיבה', match: (e) => e.kind === 'feeding' && e.record.type === 'pumped' },
  { value: 'diaper', label: 'חיתולים', match: (e) => e.kind === 'diaper' },
  { value: 'pee', label: 'פיפי', match: (e) => e.kind === 'diaper' && e.record.pee },
  { value: 'poop', label: 'קקי', match: (e) => e.kind === 'diaper' && e.record.poop },
  { value: 'sleep', label: 'שינה', match: (e) => e.kind === 'sleep' },
  { value: 'note', label: 'הערות', match: (e) => e.kind === 'note' },
  { value: 'pumping', label: 'שאיבה', match: (e) => e.kind === 'pumping' },
  { value: 'fever', label: 'חום', match: (e) => e.kind === 'fever' },
  { value: 'med', label: 'תרופות', match: (e) => e.kind === 'med' },
];

export const filterEvents = (events, value) => {
  const f = EVENT_FILTERS.find((x) => x.value === value) || EVENT_FILTERS[0];
  return events.filter(f.match);
};

export const filterLabel = (value) => EVENT_FILTERS.find((x) => x.value === value)?.label || '';
