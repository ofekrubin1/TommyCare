import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { auth } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { currentSubscription, disablePush, enablePush, pushSupport } from '@/lib/push';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const HELP = {
  'ios-home-screen': 'באייפון התראות עובדות רק מהאפליקציה שעל מסך הבית: ב-Safari לוחצים שיתוף ← ״הוספה למסך הבית״, ופותחים את TommyCare משם.',
  insecure: 'התראות עובדות רק בכתובת המאובטחת של האפליקציה (https), לא בשרת הבדיקה.',
  unsupported: 'הדפדפן הזה לא תומך בהתראות. באייפון צריך iOS 16.4 ומעלה.',
};

// Settings → push notifications on this phone (task reminders), plus a test notification.
export function PushCard() {
  const { user } = useAuth();
  const support = pushSupport();
  const [on, setOn] = useState(false);
  const [state, setState] = useState({ status: 'idle', message: '' });

  useEffect(() => { currentSubscription().then((s) => setOn(!!s)).catch(() => {}); }, []);

  const run = async (fn) => {
    setState({ status: 'busy', message: '' });
    try { await fn(); } catch (err) {
      console.error(err);
      setState({ status: 'error', message: 'משהו נכשל. נסו שוב.' });
    }
  };

  const enable = () => run(async () => {
    const permission = await enablePush(user);
    if (permission === 'granted') { setOn(true); setState({ status: 'ok', message: 'ההתראות הופעלו בטלפון הזה ✓' }); }
    else setState({ status: 'error', message: 'לא ניתן אישור להתראות. אפשר לאשר בהגדרות הטלפון ← TommyCare ← עדכונים.' });
  });
  const disable = () => run(async () => { await disablePush(); setOn(false); setState({ status: 'ok', message: 'ההתראות כובו בטלפון הזה' }); });
  const test = () => run(async () => {
    const res = await fetch('/api/send-test-push', { method: 'POST', headers: { Authorization: `Bearer ${await auth.getToken()}` } });
    const body = await res.json().catch(() => ({}));
    setState(body.ok
      ? { status: 'ok', message: 'נשלחה התראת בדיקה לטלפון שלך ✓' }
      : { status: 'error', message: body.error === 'no_key' ? 'חסר VAPID_PRIVATE_KEY בהגדרות של Cloudflare.' : body.error === 'no_devices' ? 'אין מכשירים עם התראות פעילות.' : 'השליחה נכשלה.' });
  });

  return (
    <Card className="space-y-3">
      <SectionTitle>התראות לטלפון</SectionTitle>
      <p className="text-sm text-mute">תזכורות של משימות, והתראה כשעבר זמן רב מההאכלה האחרונה.</p>
      {support !== 'ok' ? <p className="rounded-xl bg-line/40 p-3 text-sm">{HELP[support]}</p> : on ? (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={test} disabled={state.status === 'busy'}><BellRing className="h-4 w-4" />התראת בדיקה</Button>
          <Button variant="outline" className="flex-1" onClick={disable} disabled={state.status === 'busy'}>כיבוי בטלפון הזה</Button>
        </div>
      ) : (
        <Button className="w-full" onClick={enable} disabled={state.status === 'busy'}><BellRing className="h-4 w-4" />הפעלת התראות בטלפון הזה</Button>
      )}
      {state.message && <p className={`text-sm ${state.status === 'error' ? 'text-danger' : 'text-note'}`}>{state.message}</p>}
    </Card>
  );
}
