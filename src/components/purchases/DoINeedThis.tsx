import clsx from "clsx";
import { Card } from "../ui/Card";

export type Answer = "yes" | "no" | "unsure";

export interface Question {
  id: string;
  text: string;
}

export const REFLECTION_QUESTIONS: Question[] = [
  { id: "necessity", text: "Is this a necessity or a want?" },
  { id: "duplicate", text: "Do you already own something that performs the same function?" },
  { id: "frequency", text: "Will you use it often?" },
  { id: "impulse", text: "Does this feel like an impulse purchase?" },
  { id: "wait", text: "Could the purchase wait a couple of weeks?" },
  { id: "alternative", text: "Is there a cheaper alternative?" },
  { id: "goal", text: "Would this interfere with another financial goal?" },
];

export function DoINeedThis({ answers, onAnswer }: { answers: Record<string, Answer>; onAnswer: (id: string, a: Answer) => void }) {
  return (
    <Card>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--text)]">Do you really need it?</h3>
      <p className="mb-4 text-[13px] text-[var(--text-muted)]">
        No right answers here — this is just for your own clarity.
      </p>
      <div className="flex flex-col divide-y divide-[var(--border)]">
        {REFLECTION_QUESTIONS.map((q) => (
          <div key={q.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <p className="text-[13.5px] text-[var(--text)]">{q.text}</p>
            <div className="flex shrink-0 gap-1">
              {(["yes", "no", "unsure"] as Answer[]).map((a) => (
                <button
                  key={a}
                  onClick={() => onAnswer(q.id, a)}
                  className={clsx(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors",
                    answers[q.id] === a ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--text-muted)]",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
