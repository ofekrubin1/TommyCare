import { C, collection } from '@/data';
import { hm } from '@/lib/time';
import { cn } from '@/lib/utils';
import { RowActions } from '@/components/ui/RowActions';
import { KINDS } from './events';
import { isEditableKind, useQuickAdd } from './QuickAddProvider';

const COLLECTION_OF = { feeding: C.feedings, diaper: C.diapers, sleep: C.sleeps, note: C.notes, pumping: C.pumping, fever: C.fever, med: C.medDoses };

export function EventRow({ event, nameOf }) {
  const openSheet = useQuickAdd();
  const { icon: Icon, color } = KINDS[event.kind];
  const who = nameOf?.(event.record.created_by);
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn('mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl', color)}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tabular-nums text-mute" dir="ltr">{hm(event.time)}</span>
          <span className={cn('font-medium break-words', event.live && 'text-sleep')}>{event.title}</span>
        </div>
        {(event.detail || who) && (
          <p className="text-sm text-mute break-words whitespace-pre-wrap">{[event.detail, who && `נרשם ע״י ${who}`].filter(Boolean).join(' · ')}</p>
        )}
      </div>
      <RowActions
        onEdit={isEditableKind(event.kind) ? () => openSheet(event.kind, event.record) : undefined}
        onDelete={() => collection(COLLECTION_OF[event.kind]).remove(event.record.id)}
      />
    </div>
  );
}

export function EventList({ events, nameOf }) {
  return <div className="divide-y divide-line">{events.map((e) => <EventRow key={`${e.kind}-${e.record.id}`} event={e} nameOf={nameOf} />)}</div>;
}
