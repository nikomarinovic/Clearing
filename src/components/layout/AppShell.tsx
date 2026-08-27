import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { FAB } from "./FAB";
import { AddTransactionSheet } from "../transactions/AddTransactionSheet";
import { ToastViewport } from "../ui/ToastViewport";
import { CookieConsent } from "../common/CookieConsent";
import { InstallBanner } from "../common/InstallBanner";

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(111,147,234,0.08),_transparent_40%),var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="flex min-h-screen w-full flex-1 flex-col">
        <main
          className="flex-1 pb-32 lg:pb-10"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-6 lg:px-10 lg:pt-10">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <FAB onClick={() => setAddOpen(true)} />
      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <ToastViewport />
      <CookieConsent />
      <InstallBanner respectCookieConsent />
    </div>
  );
}
