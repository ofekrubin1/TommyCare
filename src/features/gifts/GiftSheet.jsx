import { useState } from 'react';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

export default function GiftSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [from, setFrom] = useState(record?.from || '');
  const [value, setValue] = useState(record?.value ?? '');
  const [note, setNote] = useState(record?.note || '');
  const [used, setUsed] = useState(record?.used ?? false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { name: name.trim(), from: from.trim(), value: value === '' ? null : Number(value), note: note.trim(), used };
    try {
      if (record) await collection(C.gifts).update(record.id, data);
      else await collection(C.gifts).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת מתנה' : 'מתנה חדשה'}>
      <Field label="מה קיבלנו"><Input autoFocus={!record} placeholder="לדוגמה: שובר BuyMe" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>ממי<Optional /></>}><Input placeholder="לדוגמה: סבתא רינה" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      <Field label={<>שווי (₪)<Optional /></>}><Input type="number" inputMode="decimal" min="0" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="קוד שובר, תוקף, איפה מממשים" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {record && <Switch label="נוצל" checked={used} onChange={setUsed} />}
      <Button className="w-full" onClick={save} disabled={saving || !name.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
