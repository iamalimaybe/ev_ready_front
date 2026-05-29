import type { ReactNode } from 'react';

type PageShellProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function PageShell({ title, eyebrow, children, actions }: PageShellProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{eyebrow}</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex shrink-0 sm:pt-8">{actions}</div> : null}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  );
}
