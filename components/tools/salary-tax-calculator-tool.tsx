"use client";

import * as React from "react";
import {
  TAX_FY_LABEL,
  compareIncomeTax,
  formatInr,
  type TaxpayerAge,
} from "@/lib/tools/income-tax";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function digits(v: string) {
  return v.replace(/\D/g, "");
}

export function SalaryTaxCalculatorTool() {
  const [grossSalary, setGrossSalary] = React.useState("1200000");
  const [otherIncome, setOtherIncome] = React.useState("0");
  const [age, setAge] = React.useState<TaxpayerAge>("below60");
  const [basicSalary, setBasicSalary] = React.useState("600000");
  const [hraReceived, setHraReceived] = React.useState("240000");
  const [rentPaid, setRentPaid] = React.useState("300000");
  const [metroCity, setMetroCity] = React.useState(true);
  const [deduction80C, setDeduction80C] = React.useState("150000");
  const [deduction80D, setDeduction80D] = React.useState("25000");
  const [homeLoanInterest, setHomeLoanInterest] = React.useState("0");
  const [employeePf, setEmployeePf] = React.useState("72000");
  const [professionalTax, setProfessionalTax] = React.useState("2400");

  const result = React.useMemo(() => {
    return compareIncomeTax({
      grossSalary: Number(grossSalary) || 0,
      otherIncome: Number(otherIncome) || 0,
      age,
      basicSalary: Number(basicSalary) || 0,
      hraReceived: Number(hraReceived) || 0,
      rentPaid: Number(rentPaid) || 0,
      metroCity,
      deduction80C: Number(deduction80C) || 0,
      deduction80D: Number(deduction80D) || 0,
      homeLoanInterest: Number(homeLoanInterest) || 0,
      employeePf: Number(employeePf) || 0,
      professionalTax: Number(professionalTax) || 0,
    });
  }, [
    grossSalary,
    otherIncome,
    age,
    basicSalary,
    hraReceived,
    rentPaid,
    metroCity,
    deduction80C,
    deduction80D,
    homeLoanInterest,
    employeePf,
    professionalTax,
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Estimate income tax and take-home for salaried individuals under New vs
        Old regime — {TAX_FY_LABEL}. Indicative only; not tax advice.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="gross">Annual gross salary (₹)</Label>
            <Input
              id="gross"
              inputMode="numeric"
              value={grossSalary}
              onChange={(e) => setGrossSalary(digits(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Taxable salary before standard deduction (exclude employer PF if
              possible).
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="other">Other income (₹ / year)</Label>
            <Input
              id="other"
              inputMode="numeric"
              value={otherIncome}
              onChange={(e) => setOtherIncome(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="age">Age category</Label>
            <select
              id="age"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={age}
              onChange={(e) => setAge(e.target.value as TaxpayerAge)}
            >
              <option value="below60">Below 60</option>
              <option value="senior">Senior (60–79) — old regime</option>
              <option value="superSenior">Super senior (80+) — old regime</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Old regime deductions (optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="basic">Basic salary (₹ / year)</Label>
            <Input
              id="basic"
              inputMode="numeric"
              value={basicSalary}
              onChange={(e) => setBasicSalary(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hra">HRA received (₹ / year)</Label>
            <Input
              id="hra"
              inputMode="numeric"
              value={hraReceived}
              onChange={(e) => setHraReceived(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rent">Rent paid (₹ / year)</Label>
            <Input
              id="rent"
              inputMode="numeric"
              value={rentPaid}
              onChange={(e) => setRentPaid(digits(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="metro"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={metroCity}
              onChange={(e) => setMetroCity(e.target.checked)}
            />
            <Label htmlFor="metro" className="font-normal">
              Metro city (50% HRA rule)
            </Label>
          </div>
          <div className="space-y-1">
            <Label htmlFor="c80">80C deductions (max ₹1.5L)</Label>
            <Input
              id="c80"
              inputMode="numeric"
              value={deduction80C}
              onChange={(e) => setDeduction80C(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="d80">80D health insurance</Label>
            <Input
              id="d80"
              inputMode="numeric"
              value={deduction80D}
              onChange={(e) => setDeduction80D(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="home">Home loan interest u/s 24(b) (max ₹2L)</Label>
            <Input
              id="home"
              inputMode="numeric"
              value={homeLoanInterest}
              onChange={(e) => setHomeLoanInterest(digits(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Take-home adjustments</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="pf">Employee PF (₹ / year)</Label>
            <Input
              id="pf"
              inputMode="numeric"
              value={employeePf}
              onChange={(e) => setEmployeePf(digits(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pt">Professional tax (₹ / year)</Label>
            <Input
              id="pt"
              inputMode="numeric"
              value={professionalTax}
              onChange={(e) => setProfessionalTax(digits(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="space-y-3 py-6">
              <p className="text-sm text-muted-foreground">Better for you</p>
              <p className="text-2xl font-bold text-primary">
                {result.better === "new" ? "New tax regime" : "Old tax regime"}
              </p>
              <p className="text-sm text-muted-foreground">
                Saves about {formatInr(result.savings)} / year vs the other
                regime (tax only).
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <RegimeCard
              title="New regime"
              preferred={result.better === "new"}
              r={result.newRegime}
            />
            <RegimeCard
              title="Old regime"
              preferred={result.better === "old"}
              r={result.oldRegime}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter your annual salary to see tax estimates.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Uses {TAX_FY_LABEL} slab rates: new regime nil up to ₹4L with 87A rebate
        up to ₹12L taxable; standard deduction ₹75,000 (new) / ₹50,000 (old).
        Surcharge marginal relief and special incomes (capital gains, etc.) are
        not modelled. Confirm with a CA or the Income Tax portal before filing.
      </p>
    </div>
  );
}

function RegimeCard({
  title,
  preferred,
  r,
}: {
  title: string;
  preferred: boolean;
  r: NonNullable<ReturnType<typeof compareIncomeTax>>["newRegime"];
}) {
  return (
    <Card className={preferred ? "border-primary/40" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          {preferred ? (
            <span className="text-xs font-medium text-primary">Recommended</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Stat label="Taxable income" value={formatInr(r.taxableIncome)} />
        <Stat label="Total tax (with cess)" value={formatInr(r.totalTax)} highlight />
        <Stat label="Monthly tax" value={formatInr(r.monthlyTax)} />
        <Stat
          label="Est. monthly in-hand"
          value={formatInr(r.estimatedMonthlyInHand)}
          highlight
        />
        <Stat label="87A rebate" value={formatInr(r.rebate87A)} />
        <Stat label="Effective rate" value={`${r.effectiveRatePct}%`} />
        {r.hraExemption > 0 ? (
          <Stat label="HRA exemption" value={formatInr(r.hraExemption)} />
        ) : null}
        {r.chapterViaDeductions > 0 ? (
          <Stat
            label="Chapter VI-A deductions"
            value={formatInr(r.chapterViaDeductions)}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          highlight ? "text-lg font-bold text-primary" : "text-base font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}
