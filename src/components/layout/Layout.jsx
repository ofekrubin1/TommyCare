import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isLocalBackend } from '@/data';
import { BottomNav } from './BottomNav';
import { ErrorBoundary } from './ErrorBoundary';
import { BottleLoader } from '@/components/ui/BottleLoader';
import { useRole } from '@/core/auth/useRole';


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
          <Suspense fallback={<BottleLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}
