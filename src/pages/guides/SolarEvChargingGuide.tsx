import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';

export default function SolarEvChargingGuide() {
  return (
    <PageShell eyebrow="Guide" title="Solar EV Charging in Pakistan">
      <GuideContent>
        <p>
          Solar charging share means the part of your EV charging energy that comes from your solar
          setup instead of the grid. For example, a 50% share means half of the charging energy is
          treated as solar-covered in the estimate.
        </p>
        <p>
          Solar is not always truly free. Your real cost can depend on system size, installation
          cost, maintenance, daytime charging, household load, net metering, and whether you use
          battery backup.
        </p>
        <p>
          Effective solar unit cost is a simple way to model that. You can enter 0 if you want to
          test a free-solar assumption, or enter your own estimate if you want a more cautious
          result.
        </p>
        <p>
          Weather, tariff slabs, and actual EV efficiency can also change real monthly savings, so
          treat the output as a planning estimate.
        </p>
        <p className="text-sm text-slate-600">
          This is general information only, not professional solar, electrical, or financial advice.
        </p>
        <LinkButton to="/solar-ev-charging">Open Solar EV Charging Estimator</LinkButton>
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
