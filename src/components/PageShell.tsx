import type { ReactNode } from 'react';

type PageShellProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
};

export default function PageShell({ title, eyebrow, children }: PageShellProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  );
}
