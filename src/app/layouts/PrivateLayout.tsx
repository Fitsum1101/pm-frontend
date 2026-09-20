import type { ComponentType } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KeyIcon, UsersIcon } from '@/components/ui/icons';
import { useAuthStore } from '@/store/authStore';
import { useAuthLogout } from '@/hooks/useAuthLogout';
import type { Permission } from '@/domain/enums/permission.enum';

type IconType = ComponentType<React.SVGProps<SVGSVGElement>>;

interface NavItem {
  to: string;
  label: string;
  emoji?: string;
  Icon?: IconType;
  permission?: Permission;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    label: 'General',
    items: [
      { to: PATHS.app.dashboard, label: 'Dashboard', emoji: '▤' },
      { to: PATHS.app.notifications, label: 'Notifications', emoji: '🔔' },
      { to: PATHS.app.profile, label: 'Profile', emoji: '👤' },
      { to: PATHS.app.settings, label: 'Settings', emoji: '⚙' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: PATHS.app.roles, label: 'Role and Permission', Icon: KeyIcon, permission: 'roles:list' },
      { to: PATHS.app.users, label: 'Users', Icon: UsersIcon, permission: 'users:list' },
    ],
  },
];

// Sidebar + header shell for the authenticated app.
export function PrivateLayout() {
  const user = useAuthStore((s) => s.user);
  const can = useAuthStore((s) => s.can);
  const logout = useAuthLogout();

  const sections = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to={PATHS.app.dashboard} className="text-lg font-bold text-primary">
            ⬡ Express Auth
          </Link>
        </div>
        <nav className="flex-1 space-y-6 p-4">
          {sections.map((section) => (
            <div key={section.label} className="space-y-1">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                >
                  <span className="flex w-4 justify-center">
                    {item.Icon ? <item.Icon /> : item.emoji}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            Log out
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
            {user?.role && (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {user.role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="md:hidden" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
