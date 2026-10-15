import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabChips } from '@/components/ui/TabChips';
import AppointmentsSection from '@/features/appointments/AppointmentsSection';
import MedsSection from '@/features/meds/MedsSection';
import GrowthSection from '@/features/growth/GrowthSection';
import VaccinesSection from '@/features/vaccines/VaccinesSection';
import FeverSection from '@/features/fever/FeverSection';
import ReportCard from '@/features/report/ReportCard';

const TABS = [
  { value: 'appointments', label: 'תורים', Section: AppointmentsSection },
  { value: 'meds', label: 'תרופות', Section: MedsSection },
  { value: 'growth', label: 'גדילה', Section: GrowthSection },
  { value: 'vaccines', label: 'חיסונים', Section: VaccinesSection },
  { value: 'fever', label: 'חום', Section: FeverSection },
];

export default function HealthPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.value === params.get('tab')) || TABS[0];
  return (
    <div className="space-y-4">
      <PageHeader title="בריאות" />
      <TabChips tabs={TABS} value={tab.value} onChange={(v) => setParams({ tab: v }, { replace: true })} />
      <tab.Section />
      <ReportCard />
    </div>
  );
}
