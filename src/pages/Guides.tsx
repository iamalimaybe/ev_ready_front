import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const guides = [
  {
    title: 'EV Bike vs Petrol Bike in Pakistan',
    description:
      'Understand the main cost and ownership factors before comparing a petrol bike with an EV bike.',
    to: '/guides/ev-bike-vs-petrol',
  },
  {
    title: 'Home EV Charging Cost in Pakistan',
    description:
      'Learn what affects home charging cost and time for EV bikes and cars.',
    to: '/guides/home-charging',
  },
  {
    title: 'Solar EV Charging in Pakistan',
    description:
      'See how solar charging share and effective solar cost can change EV charging estimates.',
    to: '/guides/solar-ev-charging',
  },
];

export default function Guides() {
  return (
    <PageShell eyebrow="Guides" title="EVReady Pakistan Guides">
      <div className="space-y-6">
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Short, practical guides for understanding EV savings, home charging, and solar charging
          before using the calculators.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.to}
              className="flex min-h-56 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-950">{guide.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{guide.description}</p>
              </div>
              <Link
                to={guide.to}
                className="mt-5 inline-flex w-fit rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Read guide
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
