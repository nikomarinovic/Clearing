import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AppDataProvider } from "./context/AppDataContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppShell } from "./components/layout/AppShell";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { useAppData } from "./hooks/useAppData";

import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import PlanPage from "./pages/PlanPage";
import PurchasesPage from "./pages/PurchasesPage";
import SavingsPage from "./pages/SavingsPage";
import TripsPage from "./pages/TripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LegalPage from "./pages/LegalPage";
import MorePage from "./pages/MorePage";

function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, isLoaded } = useAppData();

  if (!isLoaded) return <LoadingScreen />;
  if (!data.profile.onboardingComplete || !data.profile.isLoggedIn) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function RoutedApp() {
  const { data, isLoaded } = useAppData();

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/onboarding"
        element={data.profile.onboardingComplete ? <Navigate to="/" replace /> : <OnboardingPage />}
      />
      <Route
        element={
          <OnboardingGate>
            <AppShell />
          </OnboardingGate>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/:tripId" element={<TripDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/legal/:slug" element={<LegalPage />} />
        <Route path="/more" element={<MorePage />} />
      </Route>
      <Route path="*" element={<Navigate to={data.profile.onboardingComplete ? "/" : "/landing"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <RoutedApp />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AppDataProvider>
  );
}
