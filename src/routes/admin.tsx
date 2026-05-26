import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  Users,
  ShieldCheck,
  LogOut,
  LayoutList,
  Menu,
  X,
} from "lucide-react";

const adminNav = [
  { to: "/admin/stats",       label: "Stats",       icon: BarChart3 },
  { to: "/admin/workspaces",  label: "Workspaces",  icon: Building2 },
  { to: "/admin/users",       label: "Users",       icon: Users },
  { to: "/admin/plans",       label: "Plans",       icon: LayoutList },
];

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Fixed sidebar ───────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-destructive-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white leading-none">Admin Panel</p>
              <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Platform management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile hamburger ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-md border border-sidebar-border"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div className="lg:pl-64 min-h-screen">
        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}