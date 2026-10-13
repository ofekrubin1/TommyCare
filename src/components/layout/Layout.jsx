import { Outlet } from 'react-router-dom';
import { isLocalBackend } from '@/data';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen" dir="rtl">
      {isLocalBackend && (
        <div className="bg-accent/90 py-1 text-center text-xs font-medium text-white">סביבת בדיקה · הנתונים נשמרים רק בדפדפן הזה</div>
      )}
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
