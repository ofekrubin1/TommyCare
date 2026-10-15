import { useState } from 'react';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function ShoppingItemSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [quantity, setQuantity] = useState(record?.quantity || '');
  const [note, setNote] = useState(record?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { name: name.trim(), quantity: quantity.trim(), note: note.trim() };
    try {
      if (record) await collection(C.shopping).update(record.id, data);
      else await collection(C.shopping).add({ ...data, status: 'open' });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת פריט' : 'פריט חדש'}>
      <Field label="מה צריך לקנות"><Input autoFocus={!record} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>כמות<Optional /></>}><Input value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="לדוגמה: מידה 2, רק של Pampers" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Button className="w-full" onClick={save} disabled={saving || !name.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
