// Record-type filters for the journal (both the global one on top and the one inside a day).
export const EVENT_FILTERS = [
  { value: 'all', icon: '🗂️', label: 'כל הסוגים', match: () => true },
  { value: 'feeding', icon: '🍼', label: 'האכלות', match: (e) => e.kind === 'feeding' },
  { value: 'breast', icon: '🤱', label: 'הנקה', match: (e) => e.kind === 'feeding' && e.record.type === 'breast' },
  { value: 'formula', icon: '🥛', label: 'תמ״ל', match: (e) => e.kind === 'feeding' && e.record.type === 'formula' },
  { value: 'pumped', icon: '🍼', label: 'בקבוק שאיבה', match: (e) => e.kind === 'feeding' && e.record.type === 'pumped' },
  { value: 'diaper', icon: '🧷', label: 'חיתולים', match: (e) => e.kind === 'diaper' },
  { value: 'pee', icon: '💧', label: 'פיפי', match: (e) => e.kind === 'diaper' && e.record.pee },
  { value: 'poop', icon: '💩', label: 'קקי', match: (e) => e.kind === 'diaper' && e.record.poop },
  { value: 'sleep', icon: '🌙', label: 'שינה', match: (e) => e.kind === 'sleep' },
  { value: 'note', icon: '📝', label: 'הערות', match: (e) => e.kind === 'note' },
  { value: 'pumping', icon: '🧪', label: 'שאיבה', match: (e) => e.kind === 'pumping' },
  { value: 'fever', icon: '🌡️', label: 'חום', match: (e) => e.kind === 'fever' },
  { value: 'med', icon: '💊', label: 'תרופות', match: (e) => e.kind === 'med' },
];

export const filterEvents = (events, value) => {
  const f = EVENT_FILTERS.find((x) => x.value === value) || EVENT_FILTERS[0];
  return events.filter(f.match);
};

export const filterLabel = (value) => EVENT_FILTERS.find((x) => x.value === value)?.label || '';
