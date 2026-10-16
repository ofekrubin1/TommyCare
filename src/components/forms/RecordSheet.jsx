import { useRef, useState } from 'react';
import { collection } from '@/data';
import { windowStart } from '@/data/timeWindow';
import { useCollection } from '@/hooks/useCollection';
import { errorMessage } from '@/lib/errors';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { findRecentDuplicate } from '@/features/timeline/duplicates';
import { DuplicateWarning } from '@/features/timeline/DuplicateWarning';

// The shared add/edit form: a bottom sheet with the form's own fields (children) plus everything every form
// needs: save (add or update), "saving..." state, an error line, the "already logged?" check, and the button.
// Each form passes only what makes it different:
//   collection  — C.xxx                       record   — the record being edited (null = new)
//   title       — [new title, edit title] or one string
//   values()    — the data to save, built from the form's state
//   canSave     — false disables the button (required fields)
//   newDefaults — extra fields only for a new record (e.g. { done: false })
//   duplicate   — { field = 'time', isSame(r, data), label }: on add, warn about the same entry within 20 minutes
//   persist(data) → id — custom save instead of add/update (e.g. a fixed document id)
//   beforeSave(data) → ctx — runs first, straight from the tap (e.g. Google's sign-in popup)
//   afterSave(id, data, ctx) — runs after saving (e.g. Google Calendar); if it fails the sheet stays open
//   saveText    — button text
// Writes return right away (also offline). An error thrown with `userMessage` is shown as is.
export function RecordSheet({
  collection: name, record, onClose, title, values, canSave = true, newDefaults, duplicate,
  persist, beforeSave, afterSave, saveText = 'שמירה', children,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dup, setDup] = useState(null);
  const savedId = useRef(record?.id); // a retry after a failed afterSave updates instead of adding twice
  const recent = useCollection(duplicate ? name : null, { since: windowStart(2) }).data;

  const save = async (force = false) => {
    setError('');
    const data = values();
    if (!record && duplicate && !force) {
      const field = duplicate.field || 'time';
      const found = findRecentDuplicate(recent, data[field], (r) => duplicate.isSame?.(r, data) ?? true, field);
      if (found) { setDup(found); return; }
    }
    setDup(null);
    setSaving(true);
    try {
      const ctx = await beforeSave?.(data);
      let id = savedId.current;
      if (persist) id = await persist(data);
      else if (id) await collection(name).update(id, data);
      else id = await collection(name).add({ ...newDefaults, ...data });
      savedId.current = id;
      await afterSave?.(id, data, ctx);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.userMessage || errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const [newTitle, editTitle] = Array.isArray(title) ? title : [title, title];
  return (
    <Sheet open onClose={onClose} title={record ? editTitle : newTitle}>
      {children}
      {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {duplicate && (
        <DuplicateWarning found={dup} label={duplicate.label} field={duplicate.field || 'time'} onCancel={() => setDup(null)} onConfirm={() => save(true)} />
      )}
      {!dup && <Button className="w-full" onClick={() => save()} disabled={saving || !canSave}>{saving ? 'שומר...' : saveText}</Button>}
    </Sheet>
  );
}
