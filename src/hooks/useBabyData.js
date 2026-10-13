import { C } from '@/data';
import { useCollection } from './useCollection';

// Everything the timeline, journal and summaries read, in one place.
export function useBabyData() {
  const feedings = useCollection(C.feedings);
  const diapers = useCollection(C.diapers);
  const sleeps = useCollection(C.sleeps);
  const notes = useCollection(C.notes);
  const pumping = useCollection(C.pumping);
  const fever = useCollection(C.fever);
  const medDoses = useCollection(C.medDoses);
  const meds = useCollection(C.meds);
  const all = [feedings, diapers, sleeps, notes, pumping, fever, medDoses, meds];
  return {
    loading: all.some((x) => x.loading),
    error: all.find((x) => x.error)?.error || null,
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
