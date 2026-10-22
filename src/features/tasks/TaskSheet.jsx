import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarPlus } from 'lucide-react';
import { C, collection } from '@/data';
import { useSettings } from '@/core/children/useSettings';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { EVENT_DURATIONS, openIphoneCalendar } from '@/lib/calendar';
import { cachedToken, deleteGoogleEvent, getAccessToken, googleConfigured, loadGis, saveGoogleEvent } from '@/lib/googleCalendar';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Segmented, Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { taskEvent } from './taskEvent';

const googleError = (err) => Object.assign(err, {
  userMessage: `המשימה נשמרה, אבל ${err.message === 'popup_closed' ? 'ההתחברות ל-Google בוטלה' : 'העדכון ב-Google Calendar נכשל'}. אפשר לנסות שוב.`,
});

// A task for Tom (e.g. "להזמין תור לטיפת חלב"), with an optional reminder: a push notification at that time, and,
// with the two calendar buttons, an event in the iPhone calendar or Google Calendar (length: the chosen duration).
export default function TaskSheet({ record, onClose }) {
  const { settings } = useSettings();
  const [title, setTitle] = useState(record?.title || '');
  const [note, setNote] = useState(record?.note || '');
  const [remind, setRemind] = useState(!!record?.remind_at);
  const [remindAt, setRemindAt] = useState(toLocalInput(record?.remind_at));
  const [duration, setDuration] = useState(record?.duration || 15);
  // The Google event of this task: from before, or added with the button now (saved with the task).
  const [googleId, setGoogleId] = useState(record?.google_event_id || null);
  const [google, setGoogle] = useState({ status: 'idle', message: '' });
  const gcal = googleConfigured();
  useEffect(() => { if (gcal) loadGis().catch(() => {}); }, [gcal]);

  const prevGoogle = record?.google_event_id || null;
  const event = (id) => taskEvent({ id, title: title.trim(), note: note.trim(), remindAt, duration }, settings.baby_name);

  const values = () => {
    const at = remind ? fromLocalInput(remindAt) : null;
    // A new or moved reminder is sent again (remind_pending: what the server's every-minute check looks for);
    // an unchanged one keeps its "sent" mark.
    const changed = at !== (record?.remind_at || null);
    return { title: title.trim(), note: note.trim(), remind_at: at, duration: at ? duration : null, ...(changed ? { reminded_at: null, remind_pending: !!at } : {}) };
  };

  // "Google Calendar" button: adds (or updates) the event right away, like the iPhone button.
  const addToGoogle = async () => {
    try {
      setGoogle({ status: 'busy', message: '' });
      const saved = await saveGoogleEvent(await getAccessToken(), event(record?.id), googleId);
      setGoogleId(saved.id);
      setGoogle({ status: 'ok', message: googleId ? 'עודכן ב-Google Calendar ✓' : 'נוסף ל-Google Calendar ✓' });
    } catch (err) {
      console.error(err);
      setGoogle({ status: 'error', message: err.message === 'popup_closed' ? 'ההתחברות ל-Google בוטלה' : 'ההוספה ל-Google Calendar נכשלה' });
    }
  };

  // Removing the reminder also removes its Google event (Google's sign-in, if needed, opens straight from the tap).
  const beforeSave = async () => (googleId && !remind && gcal ? cachedToken() || getAccessToken().catch(() => null) : cachedToken());

  const afterSave = async (id, _data, token) => {
    try {
      if (googleId && remind) {
        // keep the event in step with what was saved (time / title / duration may have changed since the button)
        if (token) await saveGoogleEvent(token, event(id), googleId);
        if (googleId !== prevGoogle) await collection(C.tasks).update(id, { google_event_id: googleId });
      } else if (googleId && !remind && token) {
        await deleteGoogleEvent(token, googleId);
        await collection(C.tasks).update(id, { google_event_id: null });
      }
    } catch (err) {
      throw googleError(err);
    }
  };

  return (
    <RecordSheet
      collection={C.tasks} record={record} onClose={onClose} title={['משימה חדשה', 'עריכת משימה']}
      values={values} newDefaults={{ done: false }} canSave={!!title.trim()}
      beforeSave={beforeSave} afterSave={afterSave}
    >
      <Field label="מה צריך לעשות"><Input placeholder="לדוגמה: להזמין תור לטיפת חלב" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Switch label="תזכורת" checked={remind} onChange={setRemind} />
      {remind && (
        <div className="space-y-3 rounded-xl bg-line/30 p-3">
          <DateTimeField label="מתי להזכיר" value={remindAt} onChange={setRemindAt} />
          <Field as="div" label={<>משך ביומן<Optional /></>}>
            <Segmented options={EVENT_DURATIONS.map((d) => ({ value: d.value, label: d.short }))} value={duration} onChange={setDuration} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="py-2 text-sm" disabled={!title.trim()} onClick={() => openIphoneCalendar(event(record?.id))}>
              <CalendarPlus className="h-4 w-4" />יומן iPhone
            </Button>
            <Button variant="outline" className="py-2 text-sm" disabled={!title.trim() || !gcal || google.status === 'busy'} onClick={addToGoogle}>
              {googleId ? <CalendarCheck className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}יומן Google
            </Button>
          </div>
          {google.message && <p className={`text-xs ${google.status === 'error' ? 'text-danger' : 'text-note'}`}>{google.message}</p>}
        </div>
      )}
    </RecordSheet>
  );
}
