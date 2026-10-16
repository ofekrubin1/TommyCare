import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { getAccessToken, googleConfigured } from '@/lib/googleCalendar';
import { fetchEvents, planSync } from './googleImport';

// "Import from Google Calendar": one tap reads the main calendar and syncs every event titled "<baby name>-…".
export default function GoogleCalendarImport({ appointments }) {
  const { settings } = useSettings();
  const [state, setState] = useState({ status: 'idle', message: '' });
  const name = settings.baby_name;

  const run = async () => {
    try {
      setState({ status: 'busy', message: 'מתחבר ל-Google...' });
      const token = await getAccessToken();
      setState({ status: 'busy', message: 'מייבא...' });
      const plan = planSync(appointments, await fetchEvents(token, name));
      const col = collection(C.appointments);
      await Promise.all([
        ...plan.add.map((a) => col.add(a)),
        ...plan.update.map((u) => col.update(u.id, u.data)),
        ...plan.remove.map((id) => col.remove(id)),
      ]);
      const parts = [plan.add.length && `${plan.add.length} חדשים`, plan.update.length && `${plan.update.length} עודכנו`, plan.remove.length && `${plan.remove.length} הוסרו`].filter(Boolean);
      setState({ status: 'ok', message: parts.length ? `סונכרן: ${parts.join(', ')}` : 'הכל מעודכן, אין שינויים' });
    } catch (err) {
      console.error(err);
      setState({ status: 'error', message: err.message === 'popup_closed' ? 'ההתחברות בוטלה' : 'הייבוא נכשל. נסו שוב.' });
    }
  };

  if (!googleConfigured()) return null;
  return (
    <div className="mt-3 space-y-1.5 border-t border-line pt-3">
      <Button variant="outline" className="w-full py-2 text-sm" onClick={run} disabled={state.status === 'busy'}>
        <RefreshCw className={`h-4 w-4 ${state.status === 'busy' ? 'animate-spin' : ''}`} />ייבוא מ-Google Calendar
      </Button>
      <p className="text-xs text-mute">מייבא מהיומן הראשי אירועים שמתחילים ב-״{name}-״, למשל ״{name}-טיפת חלב״.</p>
      {state.message && <p className={`text-sm ${state.status === 'error' ? 'text-danger' : state.status === 'ok' ? 'text-note' : 'text-mute'}`}>{state.message}</p>}
    </div>
  );
}
