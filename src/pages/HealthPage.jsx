import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setParams({ tab: t.value }, { replace: true })}
            className={cn('flex-none rounded-full px-4 py-2 text-sm font-medium transition', t.value === tab.value ? 'bg-health text-white' : 'bg-card border border-line text-mute')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <tab.Section />
      <ReportCard />
    </div>
  );
}
