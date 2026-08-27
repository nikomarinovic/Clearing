import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "../ui/Card";
import type { PurchaseAnalysis } from "../../types";
import type { Answer } from "./DoINeedThis";

// Which answer, for each reflection question, counts as a point *for*
// buying vs a point *against* (a nudge to wait/skip). "unsure" is neutral.
const FAVORS_BUYING: Record<string, Answer> = {
  necessity: "yes", // it's a necessity
  duplicate: "no", // you don't already own something like it
  frequency: "yes", // you'll use it often
  impulse: "no", // it's not an impulse buy
  wait: "no", // it can't just wait a couple of weeks
  alternative: "no", // no cheaper alternative exists
  goal: "no", // it won't interfere with another goal
};

type Verdict = "buy" | "think" | "skip";

function scoreAnswers(answers: Record<string, Answer>) {
  let score = 0;
  let answered = 0;
  for (const [id, favored] of Object.entries(FAVORS_BUYING)) {
    const given = answers[id];
    if (!given || given === "unsure") continue;
    answered += 1;
    score += given === favored ? 1 : -1;
  }
  return { score, answered, total: Object.keys(FAVORS_BUYING).length };
}

function computeVerdict(analysis: PurchaseAnalysis, answers: Record<string, Answer>): { verdict: Verdict; reasons: string[] } {
  const { score, answered } = scoreAnswers(answers);
  const reasons: string[] = [];

  // Money is the hard gate: can't afford it, verdict can never be a clean "buy".
  if (!analysis.affordable) {
    reasons.push("It would put your projected balance below zero.");
    if (answered > 0 && score >= 3) {
      reasons.push("That said, it does sound like something you genuinely need.");
      return { verdict: "think", reasons };
    }
    return { verdict: "skip", reasons };
  }

  if (analysis.bufferReductionPercent >= 60) {
    reasons.push(`It would eat up about ${analysis.bufferReductionPercent}% of your available buffer.`);
  }

  if (answered === 0) {
    reasons.push("You can afford it financially. Answer a few reflection questions above for a fuller picture.");
    return { verdict: "think", reasons };
  }

  if (score >= 3) {
    reasons.push("Your own answers point toward this being a considered, worthwhile purchase.");
    return { verdict: "buy", reasons };
  }

  if (score <= -3) {
    reasons.push("Your answers lean heavily toward this being an impulse buy you could skip or delay.");
    return { verdict: "skip", reasons };
  }

  if (analysis.bufferReductionPercent >= 60) {
    reasons.push("Combined with the size of the hit to your buffer, it's worth sitting on this for a bit.");
  } else {
    reasons.push("It's a mixed picture — affordable, but not a clear-cut need either.");
  }
  return { verdict: "think", reasons };
}

const VERDICT_COPY: Record<Verdict, { label: string; description: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  buy: {
    label: "Go for it",
    description: "You can afford it, and it lines up with what you actually need.",
    icon: CheckCircle2,
    color: "var(--accent-green)",
    bg: "var(--accent-green-bg)",
  },
  think: {
    label: "Sleep on it",
    description: "Not a clear yes or no — give it a day or two before deciding.",
    icon: AlertTriangle,
    color: "var(--accent-amber)",
    bg: "var(--accent-amber-bg)",
  },
  skip: {
    label: "Skip it (for now)",
    description: "Either the money isn't there, or this looks like an impulse buy.",
    icon: XCircle,
    color: "var(--accent-red)",
    bg: "var(--accent-red-bg)",
  },
};

export function PurchaseVerdict({ analysis, answers }: { analysis: PurchaseAnalysis; answers: Record<string, Answer> }) {
  const { verdict, reasons } = computeVerdict(analysis, answers);
  const copy = VERDICT_COPY[verdict];
  const { answered, total } = scoreAnswers(answers);

  return (
    <Card>
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: copy.bg, color: copy.color }}
        >
          <copy.icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Our take</p>
          <h3 className="mt-0.5 text-[19px] font-semibold tracking-tight" style={{ color: copy.color }}>
            {copy.label}
          </h3>
          <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">{copy.description}</p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5 border-t border-[var(--border)] pt-4">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-[13.5px] text-[var(--text)]">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--text-faint)]" />
            {r}
          </li>
        ))}
      </ul>

      {answered < total && (
        <p className="mt-3 text-xs text-[var(--text-faint)]">
          Based on {answered} of {total} reflection answers — answer more above for a sharper verdict.
        </p>
      )}

      <p className="mt-3 text-xs text-[var(--text-faint)]">
        This is a nudge based on your numbers and your own answers, not financial advice. The choice is always yours.
      </p>
    </Card>
  );
}
