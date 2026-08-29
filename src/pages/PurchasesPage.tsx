import { useMemo, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AmountInput, Field, Input, Select } from "../components/ui/Field";
import { PurchaseAnalyzer } from "../components/purchases/PurchaseAnalyzer";
import { PurchaseVerdict } from "../components/purchases/PurchaseVerdict";
import { DoINeedThis, type Answer } from "../components/purchases/DoINeedThis";
import { SavingsImpact } from "../components/purchases/SavingsImpact";
import { useAppData } from "../hooks/useAppData";
import { calculatePurchaseImpact } from "../lib/calculations";
import { addDaysIso, todayIso } from "../lib/format";
import { ShoppingBag } from "lucide-react";

export default function PurchasesPage() {
  const { data } = useAppData();
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [targetDate, setTargetDate] = useState(addDaysIso(todayIso(), 30));
  const [hourlyWage, setHourlyWage] = useState(
    data.income.find((i) => i.hourlyWage)?.hourlyWage ? String(data.income.find((i) => i.hourlyWage)!.hourlyWage) : "",
  );
  const [goalId, setGoalId] = useState<string>(data.goals[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [analyzed, setAnalyzed] = useState(false);

  const priceValue = parseFloat(price);
  const wageValue = hourlyWage ? parseFloat(hourlyWage) : undefined;

  const analysis = useMemo(() => {
    if (!priceValue || priceValue <= 0) return null;
    return calculatePurchaseImpact(data, priceValue, targetDate, wageValue);
  }, [data, priceValue, targetDate, wageValue]);

  const selectedGoal = data.goals.find((g) => g.id === goalId);

  const handleAnalyze = () => {
    if (!product.trim() || !priceValue || priceValue <= 0) return;
    setAnalyzed(true);
  };

  return (
    <div className="pb-6">
      <PageHeader title="Can I afford it?" subtitle="Get a clear picture before you decide \u2014 the choice stays yours." />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Product">
            <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Mechanical keyboard" />
          </Field>
          <Field label="Price">
            <AmountInput value={price} onChange={setPrice} placeholder="0.00" />
          </Field>
          <Field label="Consider balance on">
            <Input type="date" value={targetDate} min={todayIso()} onChange={(e) => setTargetDate(e.target.value)} />
          </Field>
          <Field label="Your hourly wage (optional)">
            <AmountInput value={hourlyWage} onChange={setHourlyWage} placeholder="0.00" />
          </Field>
          {data.goals.length > 0 && (
            <Field label="Compare against a goal (optional)">
              <Select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">None</option>
                {data.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <Button className="mt-5" fullWidth onClick={handleAnalyze} icon={<ShoppingBag size={16} />}>
          Analyze this purchase
        </Button>
      </Card>

      {analyzed && analysis && (
        <div className="flex flex-col gap-5">
          <PurchaseAnalyzer analysis={analysis} />
          <DoINeedThis answers={answers} onAnswer={(id, a) => setAnswers((prev) => ({ ...prev, [id]: a }))} />
          <PurchaseVerdict analysis={analysis} answers={answers} />
          <SavingsImpact analysis={analysis} goal={selectedGoal} />
        </div>
      )}
    </div>
  );
}
