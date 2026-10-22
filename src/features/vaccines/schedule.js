import { addMonths, format, parseISO } from 'date-fns';

// Routine schedule based on the Israeli Ministry of Health / Tipat Halav program.
// Verify against the clinic's booklet: the exact products and timing can change.
export const VACCINE_SCHEDULE = [
  { key: 'hbv1', name: 'צהבת B · מנה 1', months: 0 },
  { key: 'hbv2', name: 'צהבת B · מנה 2', months: 1 },
  { key: 'm2_penta', name: 'מחומש (DTaP-IPV-Hib) · מנה 1', months: 2 },
  { key: 'm2_pcv', name: 'פנאומוקוק (PCV) · מנה 1', months: 2 },
  { key: 'm2_rota', name: 'רוטה · מנה 1', months: 2 },
  { key: 'm4_penta', name: 'מחומש · מנה 2', months: 4 },
  { key: 'm4_pcv', name: 'פנאומוקוק · מנה 2', months: 4 },
  { key: 'm4_rota', name: 'רוטה · מנה 2', months: 4 },
  { key: 'm6_penta', name: 'מחומש · מנה 3', months: 6 },
  { key: 'hbv3', name: 'צהבת B · מנה 3', months: 6 },
  { key: 'm6_rota', name: 'רוטה · מנה 3', months: 6 },
  { key: 'm12_mmrv', name: 'MMRV (חצבת, חזרת, אדמת, אבעבועות) · מנה 1', months: 12 },
  { key: 'm12_pcv', name: 'פנאומוקוק · מנת דחף', months: 12 },
  { key: 'm12_penta', name: 'מחומש · מנה 4', months: 12 },
  { key: 'm18_hav', name: 'צהבת A · מנה 1', months: 18 },
  { key: 'm24_hav', name: 'צהבת A · מנה 2', months: 24 },
];

export const dueDate = (birthDate, months) => (birthDate ? format(addMonths(parseISO(birthDate), months), 'yyyy-MM-dd') : null);
