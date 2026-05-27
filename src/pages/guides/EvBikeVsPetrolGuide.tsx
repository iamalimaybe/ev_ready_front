import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';

export default function EvBikeVsPetrolGuide() {
  return (
    <PageShell eyebrow="Guide" title="EV Bike vs Petrol Bike in Pakistan">
      <GuideContent>
        <p>
          This guide is for riders who use a petrol bike for daily travel and want to know whether
          an EV bike could reduce monthly running cost.
        </p>
        <p>
          Petrol cost matters because small daily trips can become a large monthly expense. An EV
          bike usually replaces petrol litres with electricity units, so the comparison depends on
          how far you ride and what you pay for fuel and electricity.
        </p>
        <p>
          EV bike savings depend on daily kilometers, petrol bike fuel average, battery size,
          range per full charge, electricity price, and charging losses. Battery and range numbers
          should be treated as estimates until verified for the exact bike model.
        </p>
        <p>
          Maintenance may be lower for some EV bikes, but battery health and future battery
          replacement cost still matter. Do not rely on running cost alone when deciding.
        </p>
        <p className="text-sm text-slate-600">
          This is general information only, not professional financial advice.
        </p>
        <LinkButton to="/ev-bike-savings">Open EV Bike Savings Calculator</LinkButton>
      </GuideContent>
    </PageShell>
  );
}

type GuideContentProps = {
  children: ReactNode;
};

function GuideContent({ children }: GuideContentProps) {
  return <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">{children}</div>;
}

type LinkButtonProps = {
  children: ReactNode;
  to: string;
};

function LinkButton({ children, to }: LinkButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
    >
      {children}
    </Link>
  );
}
