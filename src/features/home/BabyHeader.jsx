import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { ageText } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { PhotoCropper } from '@/components/ui/PhotoCropper';
import { useCanEdit } from '@/hooks/useCanEdit';

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Centered header: photo (tap → choose / crop / remove), name, age and today's date.
// The photo is a small cropped JPEG kept in settings/app in Firestore, so it syncs to every phone.
export function BabyHeader({ settings, save, now }) {
  const fileRef = useRef(null);
  const canEdit = useCanEdit();
  const [menu, setMenu] = useState(false);
  const [file, setFile] = useState(null);

  const pick = () => { setMenu(false); fileRef.current?.click(); };
  const onFile = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setFile(f); };
  const age = ageText(settings.birth_date, now);

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-accent/15 via-accent/5 to-transparent px-4 pb-3 pt-4 text-center">
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-accent/10" />
      <div className="pointer-events-none absolute -right-8 top-8 h-16 w-16 rounded-full bg-diaper/10" />

      <button
        type="button"
        onClick={() => canEdit && (settings.baby_photo ? setMenu(true) : pick())}
        disabled={!canEdit}
        aria-label={settings.baby_photo ? 'שינוי התמונה' : 'הוספת תמונה'}
        className="relative mx-auto block h-20 w-20 rounded-full bg-card p-0.5 shadow-soft ring-4 ring-accent/20"
      >
        {settings.baby_photo
          ? <img src={settings.baby_photo} alt={settings.baby_name} className="h-full w-full rounded-full object-cover" />
          : <span className="flex h-full w-full items-center justify-center rounded-full bg-accent/10 text-4xl">🐣</span>}
        {canEdit && (
          <span className="absolute -bottom-0.5 -left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-soft">
            <Camera className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <h1 className="mt-2 text-2xl font-bold tracking-tight">{settings.baby_name}</h1>
      <p className="text-sm text-mute">יום {HE_DAYS[now.getDay()]} · {format(now, 'dd/MM')}</p>
      <p className="text-sm">
        {age
          ? <span className="font-medium text-accent">{age}</span>
          : <Link to="/settings" className="font-medium text-accent underline">הוספת תאריך לידה</Link>}
      </p>

      {menu && (
        <Sheet open onClose={() => setMenu(false)} title="התמונה">
          <Button variant="soft" className="w-full" onClick={pick}><ImagePlus className="h-5 w-5" />בחירת תמונה אחרת</Button>
          <Button variant="danger" className="w-full" onClick={() => { save({ baby_photo: '' }); setMenu(false); }}><Trash2 className="h-5 w-5" />הסרת התמונה</Button>
        </Sheet>
      )}
      {file && (
        <PhotoCropper file={file} onCancel={() => setFile(null)} onSave={(dataUrl) => { save({ baby_photo: dataUrl }); setFile(null); }} />
      )}
    </header>
  );
}
