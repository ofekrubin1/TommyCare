import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen" dir="rtl">
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
