import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, FlaskConical, LogOut, Settings } from 'lucide-react';
import { auth } from '@/data';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/core/auth/AuthProvider';
import { displayUser } from '@/core/auth/username';
import { forgetGoogle } from '@/lib/googleCalendar';

const ITEMS = [
  { to: '/pumping', label: 'שאיבה ומלאי חלב', icon: FlaskConical, tone: 'text-pump bg-pump/10' },
  { to: '/health', label: 'דוח לרופא (PDF)', icon: FileText, tone: 'text-health bg-health/10' },
  { to: '/settings', label: 'הגדרות', icon: Settings, tone: 'text-mute bg-line/60' },
];

export default function MorePage() {
  const { user } = useAuth();
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
      {/* Sign out, then reload so live data subscriptions start fresh for the next login. */}
      <Card className="p-0">
        <button onClick={async () => { forgetGoogle(); await auth.signOut(); window.location.replace('/'); }} className="flex w-full items-center gap-3 px-4 py-3.5 text-right">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger"><LogOut className="h-5 w-5" /></span>
          <span className="flex-1">
            <span className="block font-medium text-danger">התנתקות</span>
            {user?.email && <span className="block text-xs text-mute" dir="ltr">{displayUser(user.email)}</span>}
          </span>
        </button>
      </Card>
    </div>
  );
}
