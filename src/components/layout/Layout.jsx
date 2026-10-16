import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isLocalBackend } from '@/data';
import { BottomNav } from './BottomNav';
import { ErrorBoundary } from './ErrorBoundary';
import { useRole } from '@/hooks/useCanEdit';

const Loading = () => <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /></div>;

export function Layout() {
  const role = useRole();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen" dir="rtl">
      {isLocalBackend && <div className="bg-accent/90 py-1 text-center text-xs font-medium text-white">סביבת בדיקה (5173) · הנתונים נשמרים רק בדפדפן הזה</div>}
      {role === 'viewer' && <div className="bg-health/90 py-1 text-center text-xs font-medium text-white">מצב צפייה · אפשר לראות הכל, בלי לשנות</div>}
      {role === 'pending' && <div className="bg-diaper/90 py-1 text-center text-xs font-medium text-white">ממתין לאישור · מצב צפייה עד שמנהל יאשר עריכה</div>}
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        {/* A crash in one screen keeps the bottom bar; moving to another screen clears it. */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}
