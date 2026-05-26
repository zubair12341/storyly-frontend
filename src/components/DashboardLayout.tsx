import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, KeyRound, LogOut, Sparkles,
  Menu, X, Tag, BarChart3, CreditCard, Settings, Code2,
  ChevronRight, BookMarked,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard",   label: "Overview",    icon: LayoutDashboard },
  { to: "/stories",     label: "Stories",     icon: BookOpen },
  { to: "/analytics",   label: "Analytics",   icon: BarChart3 },
  { to: "/categories",  label: "Categories",  icon: Tag },
  { to: "/api-keys",    label: "API Keys",    icon: KeyRound },
  { to: "/integration", label: "Integration", icon: Code2 },
  { to: "/resources",   label: "Resources",   icon: BookMarked },
];

const bottomNav = [
  { to: "/billing",  label: "Billing",  icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const NavLink = ({ to, label, icon: Icon }: (typeof nav)[0]) => {
    const active =
      location.pathname === to || location.pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            active
              ? "text-primary"
              : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
          )}
        />
        <span className="flex-1">{label}</span>
        {active && <ChevronRight className="h-3 w-3 text-primary/50 ml-auto" />}
      </Link>
    );
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "SW";

  return (
    /*
     * h-screen + overflow-hidden on the root keeps the viewport locked.
     * The sidebar and main content each manage their own internal scroll,
     * so the sidebar never moves when the page content scrolls.
     */
    <div className="h-screen overflow-hidden flex bg-background">

      {/* ── Mobile hamburger ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-md border border-sidebar-border"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          // On mobile: slide in/out from the left as a fixed overlay
          // On desktop (lg+): always visible, takes up its natural column width
          // h-full + flex-col makes it fill the full viewport height
          "fixed lg:relative inset-y-0 left-0 z-40",
          "h-full w-64 flex-shrink-0",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex-shrink-0 p-5 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              Storywidget
            </span>
          </Link>
        </div>

        {/* Scrollable nav links — grows to fill available space */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
          {nav.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}

          <div className="pt-4 pb-1 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 px-2">
              Account
            </p>
          </div>

          {bottomNav.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User footer — always pinned to the bottom of the sidebar */}
        <div className="flex-shrink-0 p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg hover:bg-sidebar-accent/40 transition-colors cursor-default">
            <div
              className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-sidebar-foreground/45">Workspace owner</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground text-xs gap-2 mt-0.5"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content — scrolls independently of the sidebar ─────────── */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}