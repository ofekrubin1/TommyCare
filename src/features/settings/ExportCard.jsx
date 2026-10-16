import { format, parseISO } from 'date-fns';
import { Download } from 'lucide-react';
import { C } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useBabyData } from '@/hooks/useBabyData';
import { dayKey } from '@/lib/time';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProfiles } from '@/features/auth/AuthProvider';
import { KINDS, toEvents } from '@/features/timeline/events';

function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// Two exports: the journal as a CSV that opens in Excel / Google Sheets (Hebrew-safe), and a full JSON backup.
export function ExportCard() {
  const data = useBabyData();
  const { nameOf } = useProfiles();
  const all = Object.fromEntries(Object.values(C).map((name) => [name, useCollection(name).data])); // eslint-disable-line react-hooks/rules-of-hooks
  const stamp = format(new Date(), 'yyyy-MM-dd');

  const exportCsv = () => {
    const events = toEvents(data).reverse(); // oldest first
    const rows = [
      ['יום (מ-06:00)', 'תאריך', 'שעה', 'סוג', 'מה', 'פרטים', 'נרשם ע״י'],
      ...events.map((e) => {
        const t = parseISO(e.time);
        return [format(parseISO(dayKey(e.time)), 'dd/MM/yyyy'), format(t, 'dd/MM/yyyy'), format(t, 'HH:mm'), KINDS[e.kind].label, e.title, e.detail || '', nameOf(e.record.created_by)];
      }),
    ];
    download('﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n'), `TommyCare-יומן-${stamp}.csv`, 'text/csv;charset=utf-8');
  };

  const exportJson = () => {
    const backup = { exported_at: new Date().toISOString(), app: 'TommyCare', collections: all };
    download(JSON.stringify(backup, null, 2), `TommyCare-גיבוי-${stamp}.json`, 'application/json');
  };

  return (
    <Card className="space-y-3">
      <SectionTitle>ייצוא נתונים</SectionTitle>
      <p className="text-sm text-mute">היומן כקובץ לאקסל, או גיבוי מלא של כל הנתונים.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={exportCsv} disabled={data.loading}><Download className="h-4 w-4" />יומן (Excel)</Button>
        <Button variant="outline" onClick={exportJson} disabled={data.loading}><Download className="h-4 w-4" />גיבוי מלא</Button>
      </div>
    </Card>
  );
}
