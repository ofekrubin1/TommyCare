import { useState } from 'react';
import { C } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Optional, Textarea } from '@/components/ui/Field';
import { CheckTile, Chip, Switch } from '@/components/ui/Choice';
import { POOP_COLORS, POOP_TEXTURES } from './diaperOptions';

export default function DiaperSheet({ record, onClose }) {
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [pee, setPee] = useState(record?.pee ?? false);
  const [poop, setPoop] = useState(record?.poop ?? false);
  const [color, setColor] = useState(record?.poop_color || '');
  const [texture, setTexture] = useState(record?.poop_texture || '');
  const [rash, setRash] = useState(record?.rash ?? false);
  const [note, setNote] = useState(record?.note || '');
  const flagged = poop && POOP_COLORS.find((c) => c.value === color)?.check;

  return (
    <RecordSheet
      collection={C.diapers} record={record} onClose={onClose} title={['החלפת חיתול', 'עריכת החתלה']}
      values={() => ({
        time: fromLocalInput(time), pee, poop,
        poop_color: poop ? color || null : null,
        poop_texture: poop ? texture || null : null,
        rash, note: note.trim(),
      })}
      canSave={!!time}
      duplicate={{ isSame: (r) => !!r.pee === pee && !!r.poop === poop, label: 'החלפת חיתול כזו' }}
    >
      <DateTimeField label="שעה" value={time} onChange={setTime} />
      <div>
        <div className="grid grid-cols-2 gap-3">
          <CheckTile emoji="💧" label="פיפי" checked={pee} onChange={setPee} />
          <CheckTile emoji="💩" label="קקי" checked={poop} onChange={setPoop} />
        </div>
        {!pee && !poop && <p className="mt-2 text-center text-xs text-mute">בלי סימון = חיתול יבש</p>}
      </div>
      {poop && (
        <>
          <Field as="div" label={<>צבע הקקי<Optional /></>}>
            <div className="flex flex-wrap gap-2">
              {POOP_COLORS.map((c) => (
                <Chip key={c.value} selected={color === c.value} onClick={() => setColor(color === c.value ? '' : c.value)}>
                  <span className="inline-block w-3 h-3 rounded-full ml-1.5 align-middle border border-black/10" style={{ background: c.swatch }} />
                  {c.label}
                </Chip>
              ))}
            </div>
          </Field>
          {flagged && <p className="rounded-xl bg-danger/10 text-danger text-sm px-3 py-2">צבע כזה כדאי לבדוק מול רופא/ת ילדים.</p>}
          <Field as="div" label={<>מרקם<Optional /></>}>
            <div className="flex flex-wrap gap-2">
              {POOP_TEXTURES.map((t) => (
                <Chip key={t.value} selected={texture === t.value} onClick={() => setTexture(texture === t.value ? '' : t.value)}>{t.label}</Chip>
              ))}
            </div>
          </Field>
        </>
      )}
      <Switch label="תפרחת חיתולים" checked={rash} onChange={setRash} />
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}
