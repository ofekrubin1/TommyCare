import { C } from '@/data';
import { RECENT_DAYS, windowStart } from '@/data/timeWindow';
import { useCollection } from '@/hooks/useCollection';

// Everything the timeline, journal and summaries read, in one place: the logs of the last `days` days
// (30 by default; the journal asks for more), plus the medicines list.
export function useBabyData(days = RECENT_DAYS) {
  const since = windowStart(days);
  const feedings = useCollection(C.feedings, { since });
  const diapers = useCollection(C.diapers, { since });
  const sleeps = useCollection(C.sleeps, { since });
  const notes = useCollection(C.notes, { since });
  const pumping = useCollection(C.pumping, { since });
  const fever = useCollection(C.fever, { since });
  const medDoses = useCollection(C.medDoses, { since });
  const meds = useCollection(C.meds);
  const all = [feedings, diapers, sleeps, notes, pumping, fever, medDoses, meds];
  return {
    loading: all.some((x) => x.loading),
    error: all.find((x) => x.error)?.error || null,
    since,
    feedings: feedings.data,
    diapers: diapers.data,
    sleeps: sleeps.data,
    notes: notes.data,
    pumping: pumping.data,
    fever: fever.data,
    medDoses: medDoses.data,
    meds: meds.data,
  };
}
