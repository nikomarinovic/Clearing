import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppDataProvider } from "./context/AppDataContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppShell } from "./components/layout/AppShell";
import { EntranceScreen } from "./components/common/EntranceScreen";
import { useAppData } from "./hooks/useAppData";

import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import PlanPage from "./pages/PlanPage";
import PurchasesPage from "./pages/PurchasesPage";
import SavingsPage from "./pages/SavingsPage";
import WishesPage from "./pages/WishesPage";
import CardEditorPage from "./pages/CardEditorPage";
import TripsPage from "./pages/TripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import BalanceSettingsPage from "./pages/settings/BalanceSettingsPage";
import AppearanceSettingsPage from "./pages/settings/AppearanceSettingsPage";
import NotificationsSettingsPage from "./pages/settings/NotificationsSettingsPage";
import HapticsSettingsPage from "./pages/settings/HapticsSettingsPage";
import InstallSettingsPage from "./pages/settings/InstallSettingsPage";
import DataSettingsPage from "./pages/settings/DataSettingsPage";
import LegalIndexPage from "./pages/settings/LegalIndexPage";
import LegalPage from "./pages/LegalPage";
import MorePage from "./pages/MorePage";

function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, isLoaded } = useAppData();

  if (!isLoaded)
    return (
      <EntranceScreen cardStyle={data.settings.cardStyle} reducedMotionPreference={data.settings.reducedMotion} totalDurationMs={1200} />
    );
  if (!data.profile.onboardingComplete || !data.profile.isLoggedIn) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function RoutedApp() {
  const { data, isLoaded } = useAppData();

  // Hold the splash for a minimum stretch so the entrance animation is
  // actually seen (localStorage reads are near-instant, so without this
  // the loading screen would just flash for a frame or not appear at all).
  // Timed to land just after the card finishes settling into place.
  // Hold the splash for a minimum stretch so the entrance animation is
  // actually seen (localStorage reads are near-instant, so without this
  // the loading screen would just flash for a frame or not appear at all).
  const SPLASH_DURATION_MS = 2100;
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinDurationElapsed(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = isLoaded && minDurationElapsed;

  return (
    <>
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, y: -10, scale: 1.06, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: [0.4, 0, 1, 1] }}
          >
            <EntranceScreen
              cardStyle={data.settings.cardStyle}
              reducedMotionPreference={data.settings.reducedMotion}
              totalDurationMs={SPLASH_DURATION_MS}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ clipPath: "circle(0% at 50% 22%)", opacity: 0.4 }}
            animate={{ clipPath: "circle(150% at 50% 22%)", opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
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
                <Route path="/wishes" element={<WishesPage />} />
                <Route path="/settings/card" element={<CardEditorPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/:tripId" element={<TripDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                <Route path="/settings/balance" element={<BalanceSettingsPage />} />
                <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
                <Route path="/settings/haptics" element={<HapticsSettingsPage />} />
                <Route path="/settings/install" element={<InstallSettingsPage />} />
                <Route path="/settings/data" element={<DataSettingsPage />} />
                <Route path="/settings/legal" element={<LegalIndexPage />} />
                <Route path="/settings/legal/:slug" element={<LegalPage />} />
                <Route path="/more" element={<MorePage />} />
              </Route>
              <Route path="*" element={<Navigate to={data.profile.onboardingComplete ? "/" : "/landing"} replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
