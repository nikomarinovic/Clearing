import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import WishesPage from "./pages/WishesPage";
import CardEditorPage from "./pages/CardEditorPage";
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

  // Hold the splash for a minimum stretch so the entrance animation is
  // actually seen (localStorage reads are near-instant, so without this
  // the loading screen would just flash for a frame or not appear at all).
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinDurationElapsed(true), 1400);
    return () => clearTimeout(t);
  }, []);


  return (
    <AnimatePresence mode="wait">
      {!isLoaded || !minDurationElapsed ? (
        <motion.div key="splash" exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.3, ease: "easeOut" }}>
          <LoadingScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
            <Route path="/settings/legal/:slug" element={<LegalPage />} />
            <Route path="/more" element={<MorePage />} />
          </Route>
          <Route path="*" element={<Navigate to={data.profile.onboardingComplete ? "/" : "/landing"} replace />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
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
