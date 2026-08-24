import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, GraduationCap, Briefcase, ArrowRight, ArrowLeft, Lock, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input } from "../ui/Field";
import { useAppData } from "../../hooks/useAppData";
import { todayIso } from "../../lib/format";
import type { UserType } from "../../types";

const TOTAL_STEPS = 7;

// Reasonably strict "does this look like a real email" check: something,
// then @, then a label, then a dot, then a 2+ letter TLD (e.g. name@domain.com).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { updateProfile, setCurrentBalance, addIncome, addExpense, addGoal, completeOnboarding, loginUser } = useAppData();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<UserType>("regular");
  const [balance, setBalance] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeLabel, setIncomeLabel] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const trimmedEmail = email.trim();
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail);
  const isPasswordLongEnough = password.length >= 6;
  const doPasswordsMatch = password.length > 0 && password === passwordConfirm;
  const canFinish = isEmailValid && isPasswordLongEnough && doPasswordsMatch;

  const emailError = trimmedEmail.length > 0 && !isEmailValid ? "Enter a valid email address, e.g. name@example.com" : null;
  const passwordError = password.length > 0 && !isPasswordLongEnough ? "Password must be at least 6 characters." : null;
  const passwordConfirmError =
    passwordConfirm.length > 0 && !doPasswordsMatch ? "Passwords don't match." : null;

  const finish = () => {
    const trimmedName = name.trim() || "there";
    updateProfile({ name: trimmedName, userType, email: email.trim() });
    setCurrentBalance(parseFloat(balance) || 0);

    if (incomeAmount && parseFloat(incomeAmount) > 0) {
      addIncome({
        label: incomeLabel.trim() || (userType === "student" ? "Expected income" : "Salary"),
        date: todayIso(),
        expectedAmount: parseFloat(incomeAmount),
        status: userType === "student" ? "forecast" : "confirmed",
        kind: userType === "student" ? "one-time" : "recurring",
      });
    }

    if (expenseName.trim() && expenseAmount && parseFloat(expenseAmount) > 0) {
      addExpense({
        name: expenseName.trim(),
        amount: parseFloat(expenseAmount),
        category: "Housing",
        date: todayIso(),
        type: "recurring",
        recurrence: "monthly",
        status: "confirmed",
      });
    }

    if (goalName.trim() && goalTarget && parseFloat(goalTarget) > 0) {
      addGoal({ name: goalName.trim(), targetAmount: parseFloat(goalTarget), currentAmount: 0 });
    }

    loginUser(trimmedName, email.trim(), password);
    completeOnboarding();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(111,147,234,0.08),_transparent_40%),var(--bg)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--text)" : "var(--border)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && (
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--text)] text-[var(--bg)]">
                  <Wallet size={22} />
                </div>
                <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
                  Let's build a clearer picture of your money.
                </h1>
                <p className="mt-3 text-[15px] text-[var(--text-muted)]">
                  A few quick questions, then you're ready. Your data stays on this device.
                </p>
                <Field label="What should we call you? (optional)">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-4" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">What best describes you?</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">
                  This changes how income planning works throughout the app.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => setUserType("student")}
                    className={`flex items-center gap-3 rounded-[16px] border p-4 text-left transition-colors ${userType === "student" ? "border-[var(--text)] bg-[var(--surface-2)]" : "border-[var(--border)]"}`}
                  >
                    <GraduationCap size={20} />
                    <span>
                      <span className="block text-[14px] font-medium">Student</span>
                      <span className="block text-xs text-[var(--text-faint)]">Irregular or month-to-month income</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setUserType("regular")}
                    className={`flex items-center gap-3 rounded-[16px] border p-4 text-left transition-colors ${userType === "regular" ? "border-[var(--text)] bg-[var(--surface-2)]" : "border-[var(--border)]"}`}
                  >
                    <Briefcase size={20} />
                    <span>
                      <span className="block text-[14px] font-medium">Regular income</span>
                      <span className="block text-xs text-[var(--text-faint)]">A steady salary or wage</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Current available money</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">What's in your account right now?</p>
                <Field label="Current balance" hint="You can always update this later.">
                  <AmountInput value={balance} onChange={setBalance} placeholder="0.00" className="mt-1 text-lg" />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Income setup</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">
                  {userType === "student" ? "Add your next expected income." : "Add your regular salary."}
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <Field label="Source">
                    <Input
                      value={incomeLabel}
                      onChange={(e) => setIncomeLabel(e.target.value)}
                      placeholder={userType === "student" ? "Part-time job" : "Salary"}
                    />
                  </Field>
                  <Field label="Amount">
                    <AmountInput value={incomeAmount} onChange={setIncomeAmount} placeholder="0.00" />
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Recurring expenses</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">Add one to start — like rent, the big one.</p>
                <div className="mt-4 flex flex-col gap-4">
                  <Field label="Name">
                    <Input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Rent" />
                  </Field>
                  <Field label="Monthly amount">
                    <AmountInput value={expenseAmount} onChange={setExpenseAmount} placeholder="0.00" />
                  </Field>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Optional savings goal</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">Something you're saving toward?</p>
                <div className="mt-4 flex flex-col gap-4">
                  <Field label="Goal name">
                    <Input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Emergency fund" />
                  </Field>
                  <Field label="Target amount">
                    <AmountInput value={goalTarget} onChange={setGoalTarget} placeholder="0.00" />
                  </Field>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--accent-green-bg)] text-[var(--accent-green)]">
                  <Lock size={22} />
                </div>
                <h2 className="text-[22px] font-semibold tracking-tight">Secure your account</h2>
                <p className="mt-2 text-[14px] text-[var(--text-muted)]">Add an email and password to protect your data.</p>
                <div className="mt-6 flex flex-col gap-4">
                  <Field label="Email address">
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={!!emailError}
                      className={emailError ? "border-[var(--accent-red)]" : undefined}
                    />
                    {emailError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-red)]">
                        <AlertCircle size={13} /> {emailError}
                      </p>
                    )}
                  </Field>
                  <Field label="Password">
                    <Input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-invalid={!!passwordError}
                      className={passwordError ? "border-[var(--accent-red)]" : undefined}
                    />
                    {passwordError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-red)]">
                        <AlertCircle size={13} /> {passwordError}
                      </p>
                    )}
                  </Field>
                  <Field label="Confirm password">
                    <Input
                      type="password"
                      autoComplete="new-password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      aria-invalid={!!passwordConfirmError}
                      className={passwordConfirmError ? "border-[var(--accent-red)]" : undefined}
                    />
                    {passwordConfirmError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-red)]">
                        <AlertCircle size={13} /> {passwordConfirmError}
                      </p>
                    )}
                    {doPasswordsMatch && (
                      <p className="mt-1.5 text-xs text-[var(--accent-green)]">Passwords match.</p>
                    )}
                  </Field>
                  <p className="text-xs text-[var(--text-muted)]">
                    Password must be at least 6 characters.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={back} icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          )}
          <Button 
            fullWidth 
            onClick={step === TOTAL_STEPS - 1 ? finish : next} 
            disabled={step === TOTAL_STEPS - 1 && !canFinish}
            icon={step === TOTAL_STEPS - 1 ? undefined : <ArrowRight size={16} />}
          >
            {step === TOTAL_STEPS - 1 ? "Create account & go to dashboard" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
