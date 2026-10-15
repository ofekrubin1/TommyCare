import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { fetchEvents, getAccessToken, googleConfigured, listCalendars, planSync } from './googleCalendar';

// "Import from Google Calendar": manual sync (one tap). The chosen calendar is remembered in settings.
export default function GoogleCalendarImport({ appointments }) {
  const { settings, save } = useSettings();
  const [state, setState] = useState({ status: 'idle', message: '' });
  const [choose, setChoose] = useState(null); // { token, calendars }

  const sync = async (token, calendarId) => {
    setState({ status: 'busy', message: 'מייבא...' });
    const plan = planSync(appointments, await fetchEvents(token, calendarId));
    const col = collection(C.appointments);
    await Promise.all([
      ...plan.add.map((a) => col.add(a)),
      ...plan.update.map((u) => col.update(u.id, u.data)),
      ...plan.remove.map((id) => col.remove(id)),
    ]);
    const parts = [plan.add.length && `${plan.add.length} חדשים`, plan.update.length && `${plan.update.length} עודכנו`, plan.remove.length && `${plan.remove.length} הוסרו`].filter(Boolean);
    setState({ status: 'ok', message: parts.length ? `סונכרן: ${parts.join(', ')}` : 'הכל מעודכן, אין שינויים' });
  };

  const start = async () => {
    try {
      setState({ status: 'busy', message: 'מתחבר ל-Google...' });
      const token = await getAccessToken();
      if (settings.google_calendar_id) return await sync(token, settings.google_calendar_id);
      setChoose({ token, calendars: await listCalendars(token) });
      setState({ status: 'idle', message: '' });
    } catch (err) {
      console.error(err);
      setState({ status: 'error', message: err.message === 'popup_closed' ? 'ההתחברות בוטלה' : 'הייבוא נכשל. נסו שוב.' });
    }
  };

  const pick = async (calendarId) => {
    await save({ google_calendar_id: calendarId, google_calendar_name: choose.calendars.find((c) => c.id === calendarId)?.name || '' });
    const { token } = choose;
    setChoose(null);
    try { await sync(token, calendarId); } catch { setState({ status: 'error', message: 'הייבוא נכשל. נסו שוב.' }); }
  };

  if (!googleConfigured()) return null;
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex-1 py-2 text-sm" onClick={start} disabled={state.status === 'busy'}>
          <RefreshCw className={`h-4 w-4 ${state.status === 'busy' ? 'animate-spin' : ''}`} />ייבוא מ-Google Calendar
        </Button>
        {settings.google_calendar_id && (
          <button className="text-xs text-mute underline" onClick={() => save({ google_calendar_id: '', google_calendar_name: '' })}>החלפת יומן</button>
        )}
      </div>
      {settings.google_calendar_name && !choose && <p className="text-xs text-mute">יומן: {settings.google_calendar_name}</p>}
      {choose && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">מאיזה יומן לייבא את התורים?</p>
          <Select defaultValue="" onChange={(e) => e.target.value && pick(e.target.value)}>
            <option value="" disabled>בחירת יומן...</option>
            {choose.calendars.map((c) => <option key={c.id} value={c.id}>{c.name}{c.primary ? ' (ראשי)' : ''}</option>)}
          </Select>
        </div>
      )}
      {state.message && <p className={`text-sm ${state.status === 'error' ? 'text-danger' : state.status === 'ok' ? 'text-note' : 'text-mute'}`}>{state.message}</p>}
    </div>
  );
}
