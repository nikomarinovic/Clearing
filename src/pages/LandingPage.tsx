import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PiggyBank, ShieldCheck, Sparkles, Wallet, TrendingUp, Target } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAppData } from "../hooks/useAppData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const features = [
  { icon: Wallet, title: "Clear cash view", text: "See what you can spend and what is already committed." },
  { icon: PiggyBank, title: "Goals that stay real", text: "Track savings targets without losing the big picture." },
  { icon: ShieldCheck, title: "Private by default", text: "Everything stays stored locally on this device." },
];

const demoData = [
  { day: "Mon", balance: 2400 },
  { day: "Tue", balance: 2210 },
  { day: "Wed", balance: 2290 },
  { day: "Thu", balance: 2000 },
  { day: "Fri", balance: 2181 },
  { day: "Sat", balance: 2500 },
  { day: "Sun", balance: 2100 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { data } = useAppData();

  useEffect(() => {
    if (data.profile.isLoggedIn && data.profile.onboardingComplete) {
      navigate("/", { replace: true });
    }
  }, [data.profile.isLoggedIn, data.profile.onboardingComplete, navigate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(111,147,234,0.18),_transparent_35%),var(--bg)] px-4 py-10 text-[var(--text)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--text)] text-[var(--bg)]">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Clearing</p>
              <p className="text-xs text-[var(--text-muted)]">Finance, without the panic.</p>
            </div>
          </div>
        </header>

        <div className="space-y-20">
          {/* Hero section */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">
              <Sparkles size={13} className="text-[var(--accent-blue)]" />
              Your money, clear and simple
            </div>

            <h1 className="max-w-2xl text-5xl font-bold tracking-[-0.03em] sm:text-6xl">
              Know where your money is going before it gets away from you.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-muted)]">
              Track income, spot upcoming costs, create goals, and see your projected balance in one simple place. No sign-ups, no servers, just you and your data.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" icon={<ArrowRight size={18} />} onClick={() => navigate("/onboarding")}>
                Get started free
              </Button>
              <p className="text-sm text-[var(--text-muted)]">
                <CheckCircle2 size={14} className="mb-0.5 mr-1 inline text-[var(--accent-green)]" />
                Completely free, runs offline
              </p>
            </div>
          </motion.div>

          {/* Features section */}
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)]/60 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent-blue)]">
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-[16px] font-semibold text-[var(--text)]">{title}</h3>
                <p className="text-[14px] leading-6 text-[var(--text-muted)]">{text}</p>
              </motion.div>
            ))}
          </div>

          {/* Demo chart section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md"
          >
            <div className="p-8">
              <div className="mb-8">
                <h2 className="mb-2 flex items-center gap-2 text-[22px] font-bold text-[var(--text)]">
                  <TrendingUp size={24} className="text-[var(--accent-green)]" />
                  See your money projected forward
                </h2>
                <p className="text-[15px] text-[var(--text-muted)]">
                  Every expense and income you add gets visualized so you know exactly what's coming.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={demoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip
                        contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px" }}
                        labelStyle={{ color: "var(--text)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="var(--accent-blue)"
                        strokeWidth={3}
                        dot={{ fill: "var(--accent-blue)", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[14px] bg-[var(--accent-green-bg)]/30 border border-[var(--accent-green)]/20 p-4">
                    <p className="text-[12px] font-medium text-[var(--text-muted)]">Safe to spend</p>
                    <p className="mt-2 text-[20px] font-bold text-[var(--accent-green)]">$1,240</p>
                  </div>
                  <div className="rounded-[14px] bg-[var(--accent-red-bg)]/30 border border-[var(--accent-red)]/20 p-4">
                    <p className="text-[12px] font-medium text-[var(--text-muted)]">This week</p>
                    <p className="mt-2 text-[20px] font-bold text-[var(--accent-red)]">-$580</p>
                  </div>
                  <div className="rounded-[14px] bg-[var(--accent-blue-bg)]/30 border border-[var(--accent-blue)]/20 p-4">
                    <p className="text-[12px] font-medium text-[var(--text-muted)]">Projected</p>
                    <p className="mt-2 text-[20px] font-bold text-[var(--accent-blue)]">+$340</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Goals section */}
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)]/40 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-[var(--accent-blue)]" />
              <h2 className="text-[22px] font-bold text-[var(--text)]">Set and track goals</h2>
            </div>
            <p className="text-[15px] leading-7 text-[var(--text-muted)]">
              Create savings goals without losing sight of what you can actually spend. Clearing shows you if a goal is realistic based on your income and expenses, keeping you grounded in reality.
            </p>
          </div>

          {/* CTA section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--accent-blue-bg)] via-[var(--surface)] to-[var(--surface)] p-10 text-center">
              <h2 className="mb-3 text-[28px] font-bold text-[var(--text)]">Ready to understand your money?</h2>
              <p className="mb-6 text-[16px] text-[var(--text-muted)]">
                It takes less than 2 minutes to get started. No credit card required.
              </p>
              <Button size="lg" icon={<ArrowRight size={18} />} onClick={() => navigate("/onboarding")}>
                Start your free account
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-[var(--border)] pt-8 text-center text-sm text-[var(--text-muted)]">
          <p>© 2026 Clearing. Your data stays on your device. Always.</p>
        </footer>
      </div>
    </div>
  );
}
