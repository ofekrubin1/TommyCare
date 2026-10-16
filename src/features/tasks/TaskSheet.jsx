import { useEffect, useRef, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { openIphoneCalendar } from '@/lib/calendar';
import { cachedToken, deleteGoogleEvent, getAccessToken, googleConfigured, loadGis, saveGoogleEvent } from '@/features/appointments/googleCalendar';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { taskEvent } from './taskEvent';

// A task for Tom (e.g. "להזמין תור לטיפת חלב"), with an optional reminder: a push notification at that time,
// and optionally an event in Google Calendar / the iPhone calendar.
export default function TaskSheet({ record, onClose }) {
  const { settings } = useSettings();
  const [title, setTitle] = useState(record?.title || '');
  const [note, setNote] = useState(record?.note || '');
  const [remind, setRemind] = useState(!!record?.remind_at);
  const [remindAt, setRemindAt] = useState(toLocalInput(record?.remind_at));
  const [google, setGoogle] = useState(!!record?.google_event_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savedId = useRef(record?.id); // a retry after a Google error updates the task instead of adding it twice
  const gcal = googleConfigured();
  useEffect(() => { if (gcal) loadGis().catch(() => {}); }, [gcal]);

  const event = () => taskEvent({ id: savedId.current, title: title.trim(), note: note.trim(), remindAt }, settings.baby_name);

  const save = async () => {
    setSaving(true);
    setError('');
    const prevGoogle = record?.google_event_id || null;
    const wantGoogle = gcal && remind && google;
    try {
      // Google's sign-in popup must open straight from the tap, before anything else is awaited.
      const token = wantGoogle ? await getAccessToken() : prevGoogle && gcal ? cachedToken() || await getAccessToken().catch(() => null) : null;
      const at = remind ? fromLocalInput(remindAt) : null;
      // A new or moved reminder is sent again; an unchanged one keeps its "sent" mark.
      const data = { title: title.trim(), note: note.trim(), remind_at: at, ...(at !== (record?.remind_at || null) ? { reminded_at: null } : {}) };
      if (savedId.current) await collection(C.tasks).update(savedId.current, data);
      else savedId.current = await collection(C.tasks).add({ ...data, done: false });

      if (wantGoogle) {
        const { id } = await saveGoogleEvent(token, event(), prevGoogle);
        if (id !== prevGoogle) await collection(C.tasks).update(savedId.current, { google_event_id: id });
      } else if (prevGoogle && token) {
        await deleteGoogleEvent(token, prevGoogle);
        await collection(C.tasks).update(savedId.current, { google_event_id: null });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(savedId.current
        ? `המשימה נשמרה, אבל ${err.message === 'popup_closed' ? 'ההתחברות ל-Google בוטלה' : 'העדכון ב-Google Calendar נכשל'}. אפשר לנסות שוב.`
        : 'השמירה נכשלה. נסו שוב.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת משימה' : 'משימה חדשה'}>
      <Field label="מה צריך לעשות"><Input autoFocus={!record} placeholder="לדוגמה: להזמין תור לטיפת חלב" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Switch label="תזכורת" checked={remind} onChange={setRemind} />
      {remind && (
        <div className="space-y-3 rounded-xl bg-line/30 p-3">
          <DateTimeField label="מתי להזכיר" value={remindAt} onChange={setRemindAt} />
          <p className="text-xs text-mute">בזמן הזה תקפוץ התראה בטלפונים שהפעילו התראות (הגדרות ← התראות לטלפון).</p>
          {gcal ? <Switch label="להוסיף גם ל-Google Calendar" checked={google} onChange={setGoogle} /> : (
            <div className="opacity-50"><Switch label="להוסיף גם ל-Google Calendar" checked={false} onChange={() => {}} /></div>
          )}
          {!gcal && <p className="-mt-2 text-xs text-mute">יופעל אחרי חיבור ל-Google (Client ID).</p>}
          <Button variant="outline" className="w-full py-2 text-sm" disabled={!title.trim()} onClick={() => openIphoneCalendar(event())}>
            <CalendarPlus className="h-4 w-4" />הוספה ליומן iPhone
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button className="w-full" onClick={save} disabled={saving || !title.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
