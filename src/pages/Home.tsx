import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const featureCards = [
  {
    category: 'Bike-focused',
    title: 'EV Bike Savings Calculator',
    description:
      'Estimate petrol bike cost, EV bike charging cost, monthly savings, and payback period.',
    to: '/ev-bike-savings',
    action: 'Estimate bike savings',
  },
  {
    category: 'General tools',
    title: 'Home Charging Cost Estimator',
    description:
      'Estimate home charging cost and charging time for an EV bike or EV car.',
    to: '/home-charging-cost',
    action: 'Estimate charging',
  },
  {
    category: 'General tools',
    title: 'Solar EV Charging Estimator',
    description:
      'Estimate how solar charging share can reduce EV bike or EV car charging cost.',
    to: '/solar-ev-charging',
    action: 'Estimate solar savings',
  },
  {
    category: 'Car-focused',
    title: 'EV Suitability Calculator',
    description:
      'Check EV car/general ownership fit, charging access, savings, city support, and intercity risk.',
    to: '/suitability',
    action: 'Start calculator',
  },
  {
    category: 'General tools',
    title: 'EV vs Petrol Cost Comparison',
    description:
      'Compare estimated monthly EV charging cost with petrol cost for your current driving pattern.',
    to: '/cost-comparison',
    action: 'Compare costs',
  },
  {
    category: 'Car-focused',
    title: 'Route Feasibility Estimator',
    description:
      'Estimate whether an EV can handle common intercity trips with your battery reserve.',
    to: '/route-feasibility',
    action: 'Check a route',
  },
  {
    category: 'Supporting tools',
    title: 'Vehicle Catalog',
    description:
      'Browse EV specs, practical range estimates, connector types, and approximate prices.',
    to: '/vehicles',
    action: 'Browse vehicles',
  },
  {
    category: 'Supporting tools',
    title: 'Charger Directory',
    description:
      'Review charger entries by city, connector, charging type, and reported status.',
    to: '/chargers',
    action: 'View chargers',
  },
  {
    category: 'Supporting tools',
    title: 'EV Savings Guides',
    description:
      'Read simple Pakistan-focused guides for EV bike savings, home charging, and solar charging.',
    to: '/guides',
    action: 'Read guides',
  },
];

const usageSteps = [
  'Start with Suitability Calculator.',
  'Compare monthly EV vs petrol cost.',
  'Check route feasibility for intercity use.',
  'Review vehicle and charger details, then verify before purchase or travel.',
];

export default function Home() {
  return (
    <PageShell eyebrow="EVReady Pakistan MVP" title="Find out if an EV is practical for you in Pakistan">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="max-w-3xl text-lg leading-8 text-slate-700">
            Estimate EV running cost, route feasibility, charging access, and vehicle fit using
            Pakistan-focused tools and backend-backed catalog data.
          </p>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Calculator outputs are estimates. Verify vehicle specs, prices, charger details, and
            availability before purchase or travel decisions.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.to}
              className="flex min-h-56 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {feature.category}
                </p>
                <h2 className="text-xl font-bold text-slate-950">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{feature.description}</p>
              </div>
              <Link
                to={feature.to}
                className="mt-5 inline-flex w-fit rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                {feature.action}
              </Link>
            </article>
          ))}
        </div>

        <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
          <h2 className="text-xl font-bold text-slate-950">How to use this MVP</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
            {usageSteps.map((step, index) => (
              <li key={step} className="rounded-md bg-white p-4">
                <span className="font-semibold text-brand-800">{index + 1}. </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Need help choosing an EV, charger, or solar setup?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Submit a simple request for EV bike, EV car, home charger, solar charging, or
            electrician guidance. A request does not guarantee a callback, booking, or price.
          </p>
          <Link
            to="/get-help"
            className="mt-5 inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Get help
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
