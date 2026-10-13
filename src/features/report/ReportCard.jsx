import { useState } from 'react';
import { FileText } from 'lucide-react';
import { C } from '@/data';
import { useBabyData } from '@/hooks/useBabyData';
import { useCollection } from '@/hooks/useCollection';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildReportHtml } from './buildReport';
import { htmlToPdf, openPendingTab } from './exportPdf';

// PDF for the pediatrician / Tipat Halav: last 7 days of totals, growth, meds, fever, next appointments.
export default function ReportCard() {
  const data = useBabyData();
  const { data: growth } = useCollection(C.growth);
  const { data: appointments } = useCollection(C.appointments);
  const { settings } = useSettings();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const win = openPendingTab();
    try {
      await htmlToPdf(buildReportHtml({ settings, data, growth, appointments }), `${settings.baby_name}_דוח.pdf`, win);
    } catch (err) {
      console.error(err);
      win?.close();
      alert('הפקת הדוח נכשלה');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-health/10 text-health"><FileText className="h-5 w-5" /></div>
      <div className="flex-1">
        <p className="font-medium">דוח לרופא</p>
        <p className="text-sm text-mute">7 ימים אחרונים, גדילה, תרופות וחום</p>
      </div>
      <Button variant="soft" className="py-2 text-sm" onClick={run} disabled={busy || data.loading}>{busy ? 'מכין...' : 'PDF'}</Button>
    </Card>
  );
}
