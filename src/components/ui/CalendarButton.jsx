import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarPlus } from 'lucide-react';
import { openIphoneCalendar } from '@/lib/calendar';
import { getAccessToken, googleConfigured, loadGis, saveGoogleEvent } from '@/lib/googleCalendar';
import { Sheet } from './Sheet';
import { Button } from './Button';

// Adds the event straight into Google Calendar (Calendar API), or opens the iPhone "Add to Calendar" screen.
// `googleEventId`: the event added before (updated instead of added twice). `onGoogleSaved({ id, updated })`.
export function CalendarButton({ event, googleEventId, onGoogleSaved, className }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', message: '' });
  // Load Google's sign-in script when the sheet opens, so the tap can open its popup right away.
  useEffect(() => { if (open && googleConfigured()) loadGis().catch(() => {}); }, [open]);

  const addToGoogle = async () => {
    if (!googleConfigured()) return setState({ status: 'error', message: 'החיבור ל-Google Calendar עוד לא הוגדר (חסר Google Client ID).' });
    try {
      setState({ status: 'busy', message: 'מוסיף ל-Google Calendar...' });
      const saved = await saveGoogleEvent(await getAccessToken(), event, googleEventId);
      await onGoogleSaved?.(saved);
      setState({ status: 'ok', message: googleEventId ? 'עודכן ב-Google Calendar ✓' : 'נוסף ל-Google Calendar ✓' });
    } catch (err) {
      console.error(err);
      setState({ status: 'error', message: err.message === 'popup_closed' ? 'ההתחברות ל-Google בוטלה' : 'ההוספה ל-Google Calendar נכשלה. נסו שוב.' });
    }
  };

  const close = () => { setOpen(false); setState({ status: 'idle', message: '' }); };
  const Icon = googleEventId ? CalendarCheck : CalendarPlus;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="הוספה ליומן" title="הוספה ליומן" className={className || 'rounded-lg p-2 text-health active:bg-line/60'}>
        <Icon className="h-4 w-4" />
      </button>
      {open && (
        <Sheet open onClose={close} title="הוספה ליומן">
          <p className="text-sm text-mute">{event.title}</p>
          <Button className="w-full" onClick={addToGoogle} disabled={state.status === 'busy'}>{googleEventId ? 'עדכון ב-Google Calendar' : 'Google Calendar'}</Button>
          <Button variant="outline" className="w-full" onClick={() => openIphoneCalendar(event)}>יומן iPhone</Button>
          {state.message && <p className={`text-sm ${state.status === 'error' ? 'text-danger' : state.status === 'ok' ? 'text-note' : 'text-mute'}`}>{state.message}</p>}
          <p className="text-xs text-mute">ההתראות מוגדרות אוטומטית: יום לפני ושעתיים לפני.</p>
        </Sheet>
      )}
    </>
  );
}
