import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';
import { AuthProvider, EnsureProfile, MigrateRoles, useAuth } from '@/features/auth/AuthProvider';
import LoginPage from '@/features/auth/LoginPage';
import { QuickAddProvider } from '@/features/timeline/QuickAddProvider';
import HomePage from '@/pages/HomePage';

// Screens (src/pages) other than home load on first visit, so the app opens faster.
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const HealthPage = lazy(() => import('@/pages/HealthPage'));
const ShoppingPage = lazy(() => import('@/pages/ShoppingPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const MorePage = lazy(() => import('@/pages/MorePage'));
const PumpingPage = lazy(() => import('@/pages/PumpingPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

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
      <MigrateRoles />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="shopping" element={<ShoppingPage />} />
          <Route path="tasks" element={<TasksPage />} />
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
        <ErrorBoundary>
          <Gate />
        </ErrorBoundary>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
