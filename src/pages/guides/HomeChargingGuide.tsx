import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';

export default function HomeChargingGuide() {
  return (
    <PageShell eyebrow="Guide" title="Home EV Charging Cost in Pakistan">
      <GuideContent>
        <p>
          Home charging cost depends on how much battery you need to refill, your electricity unit
          price, charger power, and charging losses.
        </p>
        <p>
          Battery capacity is measured in kWh. A larger battery usually needs more electricity for
          the same percentage increase, while charging from a lower current percentage to a higher
          target percentage uses more energy.
        </p>
        <p>
          Charger power affects time more than cost. A higher kW charger can be faster, but losses,
          voltage stability, and actual charger output can change the real result.
        </p>
        <p>
          Electricity tariff slabs can make home charging cost different from a simple unit-price
          estimate, especially if your household usage already reaches a higher slab.
        </p>
        <p className="text-sm text-slate-600">
          This is general information only, not professional electrical or financial advice.
        </p>
        <LinkButton to="/home-charging-cost">Open Home Charging Cost Estimator</LinkButton>
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
