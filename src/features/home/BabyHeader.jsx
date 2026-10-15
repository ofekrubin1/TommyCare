import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Camera, LoaderCircle } from 'lucide-react';
import { ageText } from '@/lib/time';
import { squarePhoto } from '@/lib/image';

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Centered header: Tom's photo (tap to change), name, age and today's date.
export function BabyHeader({ settings, save, now }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      await save({ baby_photo: await squarePhoto(file) });
    } catch {
      alert('לא הצלחנו לטעון את התמונה');
    } finally {
      setBusy(false);
    }
  };

  const age = ageText(settings.birth_date, now);
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-accent/15 via-accent/5 to-transparent px-4 pb-5 pt-6 text-center">
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-accent/10" />
      <div className="pointer-events-none absolute -right-8 top-12 h-20 w-20 rounded-full bg-diaper/10" />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        aria-label={settings.baby_photo ? 'החלפת התמונה' : 'הוספת תמונה'}
        className="relative mx-auto block h-28 w-28 rounded-full bg-card p-1 shadow-soft ring-4 ring-accent/20"
      >
        {settings.baby_photo
          ? <img src={settings.baby_photo} alt={settings.baby_name} className="h-full w-full rounded-full object-cover" />
          : <span className="flex h-full w-full items-center justify-center rounded-full bg-accent/10 text-5xl">🐣</span>}
        <span className="absolute bottom-0.5 left-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-soft">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{settings.baby_name}</h1>
      {age && <p className="mt-0.5 font-medium text-accent">{age}</p>}
      <p className="mt-1 text-sm text-mute">יום {HE_DAYS[now.getDay()]} · {format(now, 'dd/MM')}</p>
    </header>
  );
}
