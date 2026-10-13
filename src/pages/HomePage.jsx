import { differenceInCalendarDays, parseISO } from 'date-fns';
import { CalendarClock, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { C } from '@/data';
import { useBabyData } from '@/hooks/useBabyData';
import { useCollection } from '@/hooks/useCollection';
import { useNow } from '@/hooks/useNow';
import { useSettings } from '@/hooks/useSettings';
import { summarizeDay } from '@/lib/summary';
import { ageText, dayKey, shiftDay, todayKey } from '@/lib/time';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useProfiles } from '@/features/auth/AuthProvider';
import { LastStatus } from '@/features/timeline/LastStatus';
import { QuickActions } from '@/features/timeline/QuickActions';
import { EventList } from '@/features/timeline/EventRow';
import { toEvents } from '@/features/timeline/events';
import { DaySummary } from '@/features/summary/DaySummary';
import { TodayMeds } from '@/features/meds/TodayMeds';
import { upcoming, whenText } from '@/features/appointments/appointmentUtils';
import { dueVaccines } from '@/features/vaccines/VaccinesSection';

function Reminders({ appointments, vaccinations, birthDate, now }) {
  const soon = upcoming(appointments, now).filter((a) => differenceInCalendarDays(parseISO(a.date), now) <= 1);
  const done = Object.fromEntries(vaccinations.map((v) => [v.id, v]));
  const vaccines = dueVaccines(birthDate, done, 7, now);
  if (!soon.length && !vaccines.length) return null;
  return (
    <div className="space-y-2">
      {soon.map((a) => (
        <Link key={a.id} to="/health?tab=appointments" className="flex items-center gap-3 rounded-2xl bg-health/10 p-3 text-health">
          <CalendarClock className="h-5 w-5 flex-none" />
          <span className="text-sm"><b>{a.doctor_type}</b> · {whenText(a, now)}{a.location ? ` · ${a.location}` : ''}</span>
        </Link>
      ))}
      {vaccines.length > 0 && (
        <Link to="/health?tab=vaccines" className="flex items-center gap-3 rounded-2xl bg-diaper/10 p-3 text-diaper">
          <Syringe className="h-5 w-5 flex-none" />
          <span className="text-sm">חיסונים בקרוב: {vaccines.map((v) => v.name.split(' · ')[0]).filter((x, i, a) => a.indexOf(x) === i).join(', ')}</span>
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const data = useBabyData();
  const { settings } = useSettings();
  const { data: appointments } = useCollection(C.appointments);
  const { data: vaccinations } = useCollection(C.vaccinations);
  const { nameOf } = useProfiles();
  const now = useNow();
  const today = todayKey();
  const todayEvents = toEvents(data, now).filter((e) => dayKey(e.time) === today);

  return (
    <div className="space-y-4">
      <PageHeader title={settings.baby_name} subtitle={ageText(settings.birth_date, now) || 'היומן של'} />
      <LastStatus data={data} now={now} alertHours={Number(settings.feeding_alert_hours) || 3} />
      <QuickActions />
      <Reminders appointments={appointments} vaccinations={vaccinations} birthDate={settings.birth_date} now={now} />

      <Card>
        <SectionTitle>היום עד עכשיו</SectionTitle>
        <DaySummary summary={summarizeDay(today, data, now)} />
      </Card>

      <TodayMeds meds={data.meds} medDoses={data.medDoses} nameOf={nameOf} />

      <Card>
        <SectionTitle>מה קרה היום</SectionTitle>
        {todayEvents.length ? <EventList events={todayEvents} nameOf={nameOf} /> : <EmptyState text="עוד לא נרשם כלום היום. לחצו על אחד הכפתורים למעלה." />}
      </Card>

      <Card>
        <SectionTitle action={<Link to="/journal" className="text-sm text-accent">ליומן</Link>}>סיכום אתמול</SectionTitle>
        <DaySummary summary={summarizeDay(shiftDay(today, -1), data, now)} />
      </Card>
    </div>
  );
}
