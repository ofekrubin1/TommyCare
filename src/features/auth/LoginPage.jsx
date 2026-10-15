import { useState } from 'react';
import { auth } from '@/data';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { greeting } from './greeting';

const ERRORS = {
  'auth/invalid-credential': 'אימייל או סיסמה שגויים',
  'auth/invalid-email': 'כתובת אימייל לא תקינה',
  'auth/too-many-requests': 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות',
  'auth/network-request-failed': 'אין חיבור לאינטרנט',
};

// Accounts are created by the owner in Firebase Console (Authentication → Users). No self sign-up.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.signIn(email, password);
    } catch (err) {
      setError(ERRORS[err.code] || 'ההתחברות נכשלה');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5" dir="rtl">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-5xl">🐣</div>
          <h1 className="text-2xl font-bold">{greeting()}</h1>
          <p className="mt-1 text-sm text-mute">כל הרגעים של Tommy במקום אחד</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="אימייל"><Input type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="סיסמה"><Input type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button className="w-full" disabled={busy || !email || !password}>{busy ? 'מתחבר...' : 'כניסה'}</Button>
        </form>
      </Card>
    </div>
  );
}
