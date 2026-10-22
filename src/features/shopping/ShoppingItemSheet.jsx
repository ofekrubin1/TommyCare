import { useState } from 'react';
import { C } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';

export default function ShoppingItemSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [quantity, setQuantity] = useState(record?.quantity || '');
  const [note, setNote] = useState(record?.note || '');

  return (
    <RecordSheet
      collection={C.shopping} record={record} onClose={onClose} title={['פריט חדש', 'עריכת פריט']}
      values={() => ({ name: name.trim(), quantity: quantity.trim(), note: note.trim() })}
      newDefaults={{ status: 'open' }}
      canSave={!!name.trim()}
    >
      <Field label="מה צריך לקנות"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>כמות<Optional /></>}><Input value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="לדוגמה: מידה 2, רק של Pampers" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
    </RecordSheet>
  );
}
