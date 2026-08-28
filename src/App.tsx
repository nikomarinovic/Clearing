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

  // A brief light-burst that plays exactly as the splash hands off to the
  // app, timed to land right as the circular reveal starts.
  const [showFlash, setShowFlash] = useState(false);
  const ready = isLoaded && minDurationElapsed;
  useEffect(() => {
    if (!ready) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 750);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
          >
            <LoadingScreen />
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
                <Route path="/settings/legal/:slug" element={<LegalPage />} />
                <Route path="/more" element={<MorePage />} />
              </Route>
              <Route path="*" element={<Navigate to={data.profile.onboardingComplete ? "/" : "/landing"} replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, times: [0, 0.15, 1], ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle at 50% 22%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%)",
            }}
          />
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
