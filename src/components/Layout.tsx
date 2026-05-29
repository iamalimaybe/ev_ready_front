import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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
    label: 'EV & Range Anxiety',
    links: [
      { label: 'Range Anxiety Check', to: '/route-feasibility' },
      { label: 'EV Catalogue', to: '/vehicles' },
    ],
  },
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [activeMenu, setActiveMenu] = useState<string | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  function closeNavigation() {
    setActiveMenu(undefined);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav
          ref={navRef}
          className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
              <NavLink to="/" className="text-xl font-bold text-brand-700" onClick={closeNavigation}>
                EVReady Pakistan
              </NavLink>
              <p className="text-sm text-slate-600">
                EV buying and usage confidence for Pakistan
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="site-navigation"
              onClick={() => {
                setIsMobileMenuOpen((isOpen) => !isOpen);
                setActiveMenu(undefined);
              }}
            >
              Menu
            </button>
          </div>
          <div
            id="site-navigation"
            className={`${isMobileMenuOpen ? 'flex' : 'hidden'} flex-col gap-2 md:flex md:flex-row md:flex-wrap md:items-start`}
          >
            <NavLink
              to="/"
              onClick={closeNavigation}
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
                        onClick={closeNavigation}
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
              onClick={closeNavigation}
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
              onClick={closeNavigation}
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
              onClick={closeNavigation}
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
      <GoToTopButton />
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-600 sm:px-6 lg:px-8">
          © 2026 EVReady Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 360);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button
      type="button"
      className="fixed bottom-20 right-4 z-20 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-md transition hover:border-brand-500 hover:text-brand-700 sm:bottom-6"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      Top
    </button>
  );
}
