import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useCanEdit } from '@/hooks/useCanEdit';

export function Layout() {
  const canEdit = useCanEdit();
  return (
    <div className="min-h-screen" dir="rtl">
      {!canEdit && <div className="bg-health/90 py-1 text-center text-xs font-medium text-white">מצב צפייה · אפשר לראות הכל, בלי לשנות</div>}
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
