import { createContext, useCallback, useContext, useState } from 'react';
import FeedingSheet from '@/features/feeding/FeedingSheet';
import DiaperSheet from '@/features/diapers/DiaperSheet';
import SleepSheet from '@/features/sleep/SleepSheet';
import NoteSheet from '@/features/notes/NoteSheet';
import PumpingSheet from '@/features/pumping/PumpingSheet';
import FeverSheet from '@/features/fever/FeverSheet';

// Opens the right add/edit sheet from anywhere: openSheet('feeding') or openSheet('diaper', record).
const SHEETS = { feeding: FeedingSheet, diaper: DiaperSheet, sleep: SleepSheet, note: NoteSheet, pumping: PumpingSheet, fever: FeverSheet };

const QuickAddContext = createContext(() => {});

export function QuickAddProvider({ children }) {
  const [open, setOpen] = useState(null); // { kind, record }
  const openSheet = useCallback((kind, record = null) => setOpen({ kind, record }), []);
  const close = useCallback(() => setOpen(null), []);
  const SheetComponent = open && SHEETS[open.kind];
  return (
    <QuickAddContext.Provider value={openSheet}>
      {children}
      {/* key: a fresh form each time it opens */}
      {SheetComponent && <SheetComponent key={`${open.kind}-${open.record?.id || 'new'}`} record={open.record} onClose={close} />}
    </QuickAddContext.Provider>
  );
}

export const useQuickAdd = () => useContext(QuickAddContext);
export const isEditableKind = (kind) => kind in SHEETS;
