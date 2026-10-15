import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider, EnsureProfile, useAuth } from '@/features/auth/AuthProvider';
import LoginPage from '@/features/auth/LoginPage';
import { QuickAddProvider } from '@/features/timeline/QuickAddProvider';
import HomePage from '@/pages/HomePage';
import JournalPage from '@/pages/JournalPage';
import HealthPage from '@/pages/HealthPage';
import MorePage from '@/pages/MorePage';
import ShoppingPage from '@/features/shopping/ShoppingPage';
import PumpingPage from '@/features/pumping/PumpingPage';
import SettingsPage from '@/features/settings/SettingsPage';

function Splash() {
  return <div className="flex min-h-screen items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /></div>;
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <LoginPage />;
  return (
    <QuickAddProvider>
      <EnsureProfile />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="shopping" element={<ShoppingPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="pumping" element={<PumpingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </QuickAddProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Gate />
      </BrowserRouter>
    </AuthProvider>
  );
}
