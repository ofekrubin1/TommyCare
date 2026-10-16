import { useState } from 'react';
import { C } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';

export default function GiftSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [from, setFrom] = useState(record?.from || '');
  const [value, setValue] = useState(record?.value ?? '');
  const [note, setNote] = useState(record?.note || '');
  const [used, setUsed] = useState(record?.used ?? false);

  return (
    <RecordSheet
      collection={C.gifts} record={record} onClose={onClose} title={['מתנה חדשה', 'עריכת מתנה']}
      values={() => ({ name: name.trim(), from: from.trim(), value: value === '' ? null : Number(value), note: note.trim(), used })}
      canSave={!!name.trim()}
    >
      <Field label="מה קיבלנו"><Input autoFocus={!record} placeholder="לדוגמה: שובר BuyMe" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>ממי<Optional /></>}><Input placeholder="לדוגמה: סבתא רינה" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      <Field label={<>שווי (₪)<Optional /></>}><Input type="number" inputMode="decimal" min="0" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="קוד שובר, תוקף, איפה מממשים" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {record && <Switch label="נוצל" checked={used} onChange={setUsed} />}
    </RecordSheet>
  );
}
