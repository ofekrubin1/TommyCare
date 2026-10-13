import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, FlaskConical, Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

const ITEMS = [
  { to: '/pumping', label: 'שאיבה ומלאי חלב', icon: FlaskConical, tone: 'text-pump bg-pump/10' },
  { to: '/health', label: 'דוח לרופא (PDF)', icon: FileText, tone: 'text-health bg-health/10' },
  { to: '/settings', label: 'הגדרות', icon: Settings, tone: 'text-mute bg-line/60' },
];

export default function MorePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="עוד" />
      <Card className="divide-y divide-line p-0">
        {ITEMS.map(({ to, label, icon: Icon, tone }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="flex-1 font-medium">{label}</span>
            <ChevronLeft className="h-5 w-5 text-mute" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
