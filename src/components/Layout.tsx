import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const navGroups = [
  {
    label: 'Savings Tools',
    links: [
      { label: 'EV Bike Savings', to: '/ev-bike-savings' },
      { label: 'Cost Comparison', to: '/cost-comparison' },
      { label: 'Suitability Calculator', to: '/suitability' },
    ],
  },
  {
    label: 'Charging Tools',
    links: [
      { label: 'Home Charging', to: '/home-charging-cost' },
      { label: 'Solar Charging', to: '/solar-ev-charging' },
      { label: 'Charger Directory', to: '/chargers' },
    ],
  },
  {
    label: 'Vehicles & Trips',
    links: [
      { label: 'Route Feasibility', to: '/route-feasibility' },
      { label: 'Vehicle Catalog', to: '/vehicles' },
    ],
  },
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [activeMenu, setActiveMenu] = useState<string | undefined>();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setActiveMenu(undefined);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveMenu(undefined);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav
          ref={navRef}
          className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <NavLink to="/" className="text-xl font-bold text-brand-700">
              EVReady Pakistan
            </NavLink>
            <p className="text-sm text-slate-600">
              EV buying and usage confidence for Pakistan
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-start">
            <NavLink
              to="/"
              onClick={() => setActiveMenu(undefined)}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              Home
            </NavLink>

            {navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu((currentMenu) =>
                      currentMenu === group.label ? undefined : group.label,
                    )
                  }
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 md:w-auto"
                >
                  {group.label}
                </button>
                {activeMenu === group.label ? (
                  <div className="mt-1 grid gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-sm md:absolute md:left-0 md:z-10 md:min-w-56">
                    {group.links.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setActiveMenu(undefined)}
                        className={({ isActive }) =>
                          [
                            'rounded-md px-3 py-2 text-sm font-medium transition',
                            isActive
                              ? 'bg-brand-700 text-white'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                          ].join(' ')
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <NavLink
              to="/guides"
              onClick={() => setActiveMenu(undefined)}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              Guides
            </NavLink>

            <NavLink
              to="/get-help"
              onClick={() => setActiveMenu(undefined)}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              Get EV Help
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setActiveMenu(undefined)}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              Contact Us
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-600 sm:px-6 lg:px-8">
          © 2026 EVReady Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
