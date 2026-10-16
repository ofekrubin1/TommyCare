import { useEffect, useState } from 'react';
import { Plus, Send, X } from 'lucide-react';
import { auth } from '@/data';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

const TEST_ERRORS = {
  no_email: 'שמרו קודם כתובת אימייל',
  not_signed_in: 'צריך להתחבר מחדש',
};
const ROBOT = {
  missing: 'אבל המייל היומי לא יישלח: חסרים TC_ROBOT_EMAIL / TC_ROBOT_PASSWORD ב-Netlify.',
  bad_login: 'אבל המייל היומי לא יישלח: משתמש המערכת (TC_ROBOT_EMAIL / TC_ROBOT_PASSWORD) לא מצליח להתחבר.',
  error: 'אבל בדיקת משתמש המערכת נכשלה.',
};
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Saved list, or the single address from before multi-recipient support.
export const summaryRecipients = (settings) =>
  settings.summary_emails?.length ? settings.summary_emails : settings.summary_email ? [settings.summary_email] : [];

// 06:00 email with the summary of the day that just ended, to one or more addresses.
export function SummaryEmailCard({ settings, save }) {
  const saved = summaryRecipients(settings);
  const [emails, setEmails] = useState(saved);
  const [draft, setDraft] = useState('');
  const [enabled, setEnabled] = useState(!!settings.summary_enabled);
  const [state, setState] = useState({ status: 'idle', message: '' });
  useEffect(() => { setEmails(summaryRecipients(settings)); setEnabled(!!settings.summary_enabled); }, [JSON.stringify(saved), settings.summary_enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(emails) !== JSON.stringify(saved) || enabled !== !!settings.summary_enabled;
  const canTest = !import.meta.env.DEV; // functions exist only on the deployed site

  const add = () => {
    const e = draft.trim().toLowerCase();
    if (!isEmail(e) || emails.includes(e)) return;
    setEmails([...emails, e]);
    setDraft('');
  };
  const persist = () => save({ summary_emails: emails, summary_email: emails[0] || '', summary_enabled: enabled });

  const sendTest = async () => {
    setState({ status: 'sending', message: '' });
    try {
      if (dirty) await persist();
      const res = await fetch('/api/send-test-summary', { method: 'POST', headers: { Authorization: `Bearer ${await auth.getToken()}` } });
      const body = await res.json().catch(() => ({}));
      setState(res.ok && body.ok
        ? body.robot === 'ok'
          ? { status: 'ok', message: `נשלח מייל בדיקה אל ${body.to}. המייל היומי ב-06:00 מוכן ✓` }
          : { status: 'error', message: `נשלח מייל בדיקה אל ${body.to}, ${ROBOT[body.robot] || ROBOT.error}` }
        : { status: 'error', message: TEST_ERRORS[body.error] || `השליחה נכשלה: ${body.error || res.status}` });
    } catch {
      setState({ status: 'error', message: 'השליחה נכשלה. בדקו את החיבור לאינטרנט.' });
    }
  };

  return (
    <Card className="space-y-3">
      <SectionTitle>סיכום יומי במייל</SectionTitle>
      <p className="text-sm text-mute">כל בוקר ב-06:00: האכלות, חיתולים ושינה של היום שהסתיים.</p>
      <Field as="div" label="נשלח אל">
        {emails.length > 0 && (
          <div className="space-y-1.5">
            {emails.map((e) => (
              <div key={e} className="flex items-center gap-2 rounded-xl bg-bg/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm" dir="ltr">{e}</span>
                <button type="button" onClick={() => setEmails(emails.filter((x) => x !== e))} aria-label={`הסרת ${e}`} className="p-1 text-mute"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input type="email" dir="ltr" placeholder="name@gmail.com" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button variant="soft" className="flex-none px-3" onClick={add} disabled={!isEmail(draft.trim())} aria-label="הוספת אימייל"><Plus className="h-5 w-5" /></Button>
        </div>
      </Field>
      <Switch label="לשלוח סיכום כל בוקר" checked={enabled} onChange={setEnabled} />
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={persist} disabled={!dirty || (enabled && !emails.length)}>{dirty ? 'שמירה' : 'נשמר ✓'}</Button>
        <Button variant="outline" onClick={sendTest} disabled={!canTest || !emails.length || state.status === 'sending'}>
          <Send className="h-4 w-4" />{state.status === 'sending' ? 'שולח...' : 'מייל בדיקה'}
        </Button>
      </div>
      {!canTest && <p className="text-xs text-mute">מייל בדיקה זמין באתר עצמו (אחרי ההעלאה ל-Netlify).</p>}
      {state.message && <p className={`text-sm ${state.status === 'ok' ? 'text-note' : 'text-danger'}`}>{state.message}</p>}
    </Card>
  );
}
