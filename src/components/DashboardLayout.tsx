import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, KeyRound, LogOut, Sparkles,
  Menu, X, Tag, BarChart3, CreditCard, Settings, Code2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard",   label: "Overview",     icon: LayoutDashboard },
  { to: "/stories",     label: "Stories",       icon: BookOpen },
  { to: "/analytics",   label: "Analytics",     icon: BarChart3 },
  { to: "/categories",  label: "Categories",    icon: Tag },
  { to: "/api-keys",    label: "API Keys",      icon: KeyRound },
  { to: "/integration", label: "Integration",   icon: Code2 },
];

const bottomNav = [
  { to: "/billing",     label: "Billing",       icon: CreditCard },
  { to: "/settings",    label: "Settings",      icon: Settings },
];

export function DashboardLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const NavLink = ({ to, label, icon: Icon }: typeof nav[0]) => {
    const active = location.pathname === to || location.pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/50",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base text-white">Storywidget</span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => <NavLink key={item.to} {...item} />)}

          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
              Account
            </p>
          </div>
          {bottomNav.map((item) => <NavLink key={item.to} {...item} />)}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/60">Signed in as</p>
            <p className="text-sm truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}