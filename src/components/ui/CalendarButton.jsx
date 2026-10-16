import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { openGoogleCalendar, openIphoneCalendar } from '@/lib/calendar';
import { Sheet } from './Sheet';
import { Button } from './Button';

// Calendar icon → choose Google Calendar or the iPhone calendar. The calendar app then shows its own alert.
export function CalendarButton({ event, className }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="הוספה ליומן" title="הוספה ליומן" className={className || 'rounded-lg p-2 text-health active:bg-line/60'}>
        <CalendarPlus className="h-4 w-4" />
      </button>
      {open && (
        <Sheet open onClose={() => setOpen(false)} title="הוספה ליומן">
          <p className="text-sm text-mute">{event.title}</p>
          <Button className="w-full" onClick={() => { openGoogleCalendar(event); setOpen(false); }}>Google Calendar</Button>
          <Button variant="outline" className="w-full" onClick={() => { setOpen(false); openIphoneCalendar(event); }}>יומן iPhone</Button>
          <p className="text-xs text-mute">ביומן אפשר לבחור מתי לקבל התראה (למשל שעה לפני).</p>
        </Sheet>
      )}
    </>
  );
}
