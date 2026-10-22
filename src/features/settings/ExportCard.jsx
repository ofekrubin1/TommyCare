import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Upload } from 'lucide-react';
import { dayKey } from '@/lib/time';
import { reportError } from '@/lib/errors';
import { saveFile } from '@/lib/saveFile';
import { useIsOwner } from '@/hooks/useCanEdit';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useProfiles } from '@/features/auth/AuthProvider';
import { KINDS, toEvents } from '@/features/timeline/events';
import { buildBackup, describeBackup, restoreBackup } from './backup';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function journalCsv(backup, nameOf) {
  const rows = [['ילד/ה', 'יום (מ-06:00)', 'תאריך', 'שעה', 'סוג', 'מה', 'פרטים', 'נרשם ע״י']];
  for (const child of backup.children) {
    const r = child.records;
    const events = toEvents({ feedings: r.feedings, diapers: r.diapers, sleeps: r.sleeps, notes: r.notes, pumping: r.pumping, fever: r.fever, medDoses: r.med_doses, meds: r.meds }).reverse();
    for (const e of events) {
      const t = parseISO(e.time);
      rows.push([child.name, format(parseISO(dayKey(e.time)), 'dd/MM/yyyy'), format(t, 'dd/MM/yyyy'), format(t, 'HH:mm'), KINDS[e.kind].label, e.title, e.detail || '', nameOf(e.record.created_by)]);
    }
  }
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}

// "Restore from backup": pick a file → see what's in it → confirm.
function RestoreSheet({ backup, info, onClose }) {
  const [done, setDone] = useState(null);
  return (
    <Sheet open onClose={onClose} title="שחזור מגיבוי">
      {done !== null ? (
        <>
          <p className="text-[15px]">שוחזרו {done} רשומות ✓</p>
          <Button className="w-full" onClick={onClose}>סגירה</Button>
        </>
      ) : (
        <>
          <p className="text-sm text-mute">גיבוי מ-{info.exportedAt ? format(parseISO(info.exportedAt), 'dd/MM/yyyy HH:mm') : '?'}</p>
          <ul className="space-y-1 text-[15px]">
            {info.children.map((c) => <li key={c.name}>• {c.name}: {c.records} רשומות{info.version === 1 ? ' (ישוחזרו לילד/ה שנבחר/ה עכשיו)' : ''}</li>)}
            <li>• משותף למשפחה (קניות, מתנות, משימות): {info.shared}</li>
          </ul>
          <p className="text-sm text-mute">רשומות שנמחקו יחזרו, וקיימות יוחלפו בגרסה שבגיבוי. שום דבר אחר לא נמחק. הרשאות משתמשים לא משתנות.</p>
          <Button className="w-full" onClick={() => setDone(restoreBackup(backup))}><Upload className="h-4 w-4" />שחזור</Button>
          <Button variant="outline" className="w-full" onClick={onClose}>ביטול</Button>
        </>
      )}
    </Sheet>
  );
}

// Export: the journal for Excel (all children) and a full JSON backup. Restore (owner): from such a backup.
// The data is read when the card opens, because the iPhone share sheet only opens straight from a tap.
export function ExportCard() {
  const { nameOf } = useProfiles();
  const isOwner = useIsOwner();
  const [backup, setBackup] = useState(null);
  const [restore, setRestore] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);
  const stamp = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    let alive = true;
    buildBackup().then((b) => alive && setBackup(b)).catch((err) => reportError(err, 'export load'));
    return () => { alive = false; };
  }, []);

  const exportCsv = () => saveFile(journalCsv(backup, nameOf), `TommyCare-יומן-${stamp}.csv`, 'text/csv');
  const exportJson = () => saveFile(JSON.stringify(backup, null, 2), `TommyCare-גיבוי-${stamp}.json`, 'application/json');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError('');
    try {
      const data = JSON.parse(await file.text());
      setRestore({ backup: data, info: describeBackup(data) });
    } catch (err) {
      setFileError(err instanceof SyntaxError ? 'הקובץ לא תקין (לא JSON).' : err.message);
    }
  };

  return (
    <Card className="space-y-3">
      <SectionTitle>ייצוא ושחזור</SectionTitle>
      <p className="text-sm text-mute">היומן כקובץ לאקסל, או גיבוי מלא של כל הנתונים. בטלפון נפתחת חלונית השיתוף (״שמירה בקבצים״, וואטסאפ, מייל).</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={exportCsv} disabled={!backup}><Download className="h-4 w-4" />{backup ? 'יומן (Excel)' : 'מכין...'}</Button>
        <Button variant="outline" onClick={exportJson} disabled={!backup}><Download className="h-4 w-4" />{backup ? 'גיבוי מלא' : 'מכין...'}</Button>
      </div>
      {isOwner && (
        <>
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" />שחזור מקובץ גיבוי</Button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
          {fileError && <p className="text-sm text-danger">{fileError}</p>}
        </>
      )}
      {restore && <RestoreSheet {...restore} onClose={() => setRestore(null)} />}
    </Card>
  );
}
