import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Download } from 'lucide-react';
import { C, collection } from '@/data';
import { dayKey } from '@/lib/time';
import { reportError } from '@/lib/errors';
import { saveFile } from '@/lib/saveFile';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProfiles } from '@/features/auth/AuthProvider';
import { KINDS, toEvents } from '@/features/timeline/events';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
// Device push addresses aren't part of a backup.
const BACKUP_COLLECTIONS = Object.values(C).filter((name) => name !== C.pushSubs);

// Two exports of ALL the data (screens only load recent days): the journal as a CSV that opens in Excel /
// Google Sheets (Hebrew-safe), and a full JSON backup. The data is read when the card opens, because the
// iPhone share sheet only opens straight from a tap (no waiting in between).
export function ExportCard() {
  const { nameOf } = useProfiles();
  const [all, setAll] = useState(null);
  const stamp = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    let alive = true;
    Promise.all(BACKUP_COLLECTIONS.map(async (name) => [name, await collection(name).fetchAll()]))
      .then((entries) => alive && setAll(Object.fromEntries(entries)))
      .catch((err) => reportError(err, 'export load'));
    return () => { alive = false; };
  }, []);

  const exportCsv = () => {
    const logs = { feedings: all.feedings, diapers: all.diapers, sleeps: all.sleeps, notes: all.notes, pumping: all.pumping, fever: all.fever, medDoses: all.med_doses, meds: all.meds };
    const events = toEvents(logs).reverse(); // oldest first
    const rows = [
      ['יום (מ-06:00)', 'תאריך', 'שעה', 'סוג', 'מה', 'פרטים', 'נרשם ע״י'],
      ...events.map((e) => {
        const t = parseISO(e.time);
        return [format(parseISO(dayKey(e.time)), 'dd/MM/yyyy'), format(t, 'dd/MM/yyyy'), format(t, 'HH:mm'), KINDS[e.kind].label, e.title, e.detail || '', nameOf(e.record.created_by)];
      }),
    ];
    saveFile('﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'), `TommyCare-יומן-${stamp}.csv`, 'text/csv');
  };

  const exportJson = () => {
    const backup = { exported_at: new Date().toISOString(), app: 'TommyCare', collections: all };
    saveFile(JSON.stringify(backup, null, 2), `TommyCare-גיבוי-${stamp}.json`, 'application/json');
  };

  return (
    <Card className="space-y-3">
      <SectionTitle>ייצוא נתונים</SectionTitle>
      <p className="text-sm text-mute">היומן כקובץ לאקסל, או גיבוי מלא של כל הנתונים. בטלפון נפתחת חלונית השיתוף (״שמירה בקבצים״, וואטסאפ, מייל).</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={exportCsv} disabled={!all}><Download className="h-4 w-4" />{all ? 'יומן (Excel)' : 'מכין...'}</Button>
        <Button variant="outline" onClick={exportJson} disabled={!all}><Download className="h-4 w-4" />{all ? 'גיבוי מלא' : 'מכין...'}</Button>
      </div>
    </Card>
  );
}
