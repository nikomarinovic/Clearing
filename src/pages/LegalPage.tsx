import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "../components/ui/Card";
import { LEGAL_DOCS } from "../lib/legalContent";

export default function LegalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const doc = slug ? LEGAL_DOCS[slug] : undefined;

  if (!doc) {
    return (
      <div className="py-16 text-center text-[15px] text-[var(--text-muted)]">
        That legal page couldn't be found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="mb-2 text-[24px] font-semibold tracking-tight text-[var(--text)]">{doc.title}</h1>
      <p className="mb-6 text-[14.5px] leading-relaxed text-[var(--text-muted)]">{doc.intro}</p>
      <Card className="flex flex-col gap-5">
        {doc.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="mb-1.5 text-[15px] font-semibold text-[var(--text)]">{s.heading}</h2>
            <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </div>
        ))}
      </Card>
      <p className="mt-5 text-xs text-[var(--text-faint)]">
        This is placeholder text, not legal advice. It should be reviewed by a qualified professional before commercial use.
      </p>
    </div>
  );
}
