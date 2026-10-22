import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Camera, ImagePlus, Trash2, X } from 'lucide-react';
import { ageText } from '@/lib/time';
import { Button } from '@/components/ui/Button';
import { PhotoCropper } from '@/components/ui/PhotoCropper';
import { useCanEdit } from '@/hooks/useCanEdit';

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Full-screen photo; editors can replace or remove it from here.
function PhotoViewer({ src, name, canEdit, onReplace, onRemove, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/90 p-6" dir="rtl" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="סגירה" className="absolute left-4 top-4 rounded-full bg-white/10 p-2 text-white" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        <X className="h-6 w-6" />
      </button>
      <img src={src} alt={name} className="max-h-[70dvh] w-full max-w-md rounded-3xl object-contain" onClick={(e) => e.stopPropagation()} />
      <p className="text-lg font-semibold text-white">{name}</p>
      {canEdit && (
        <div className="grid w-full max-w-md grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <Button className="bg-white text-ink" onClick={onReplace}><ImagePlus className="h-5 w-5" />החלפה</Button>
          <Button className="bg-danger text-white" onClick={onRemove}><Trash2 className="h-5 w-5" />הסרה</Button>
        </div>
      )}
    </div>,
    document.body,
  );
}

// Centered header: photo (tap → view full screen, replace, remove), name, age and today's date.
// The photo is a small cropped JPEG kept in settings/app in Firestore, so it syncs to every phone.
export function BabyHeader({ settings, save, now }) {
  const fileRef = useRef(null);
  const canEdit = useCanEdit();
  const [viewing, setViewing] = useState(false);
  const [file, setFile] = useState(null);

  const pick = () => { setViewing(false); fileRef.current?.click(); };
  const onFile = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setFile(f); };
  const age = ageText(settings.birth_date, now);

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-accent/15 via-accent/5 to-transparent px-4 pb-3 pt-4 text-center">
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-accent/10" />
      <div className="pointer-events-none absolute -right-8 top-8 h-16 w-16 rounded-full bg-diaper/10" />

      <button
        type="button"
        onClick={() => (settings.baby_photo ? setViewing(true) : canEdit && pick())}
        disabled={!settings.baby_photo && !canEdit}
        aria-label={settings.baby_photo ? 'הצגת התמונה' : 'הוספת תמונה'}
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

      {viewing && (
        <PhotoViewer
          src={settings.baby_photo} name={settings.baby_name} canEdit={canEdit} onReplace={pick}
          onRemove={() => { save({ baby_photo: '' }); setViewing(false); }} onClose={() => setViewing(false)}
        />
      )}
      {file && (
        <PhotoCropper size={640} file={file} onCancel={() => setFile(null)} onSave={(dataUrl) => { save({ baby_photo: dataUrl }); setFile(null); }} />
      )}
    </header>
  );
}
