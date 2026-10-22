import { differenceInMinutes, parseISO } from 'date-fns';

export const DUPLICATE_WINDOW_MIN = 20;

// The closest record within 20 minutes of `timeIso` that `isSame` considers the same kind of entry.
// Used when adding (not editing): the form shows <DuplicateWarning> and saves only after "add anyway".
export function findRecentDuplicate(list, timeIso, isSame, field = 'time') {
  const t = parseISO(timeIso);
  return list
    .filter((r) => r[field] && isSame(r) && Math.abs(differenceInMinutes(parseISO(r[field]), t)) < DUPLICATE_WINDOW_MIN)
    .sort((a, b) => Math.abs(parseISO(a[field]) - t) - Math.abs(parseISO(b[field]) - t))[0] || null;
}
