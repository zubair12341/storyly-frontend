import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, ShoppingBag, Newspaper, Zap,
  Building2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/use-cases")({
  component: UseCasesPage,
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NAV                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function PublicNav() {
  const { isAuthenticated } = useAuth();
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "var(--hero-border)",
        background: "oklch(0.10 0.025 265 / 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--hero-fg)" }}>
            Storywidget
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/features"   className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Features</Link>
          <Link
                to="/use-cases"
                className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                style={{ color: '#fff', opacity: 1, borderBottom: '2px solid oklch(0.62 0.22 265)' }}
            >
                Use Cases
            </Link>
          <Link to="/developers" className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Developers</Link>
          <Link to="/pricing"    className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Button variant="brand" size="sm" asChild>
              <Link to="/dashboard">
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost-dark" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="brand" size="sm" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function UseCasesPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--hero-bg)" }}>
      <PublicNav />
      <main className="flex-1">
        <HeroSection />
        <UseCaseCardsSection />
        <ResultsSection />
        <CtaBannerSection isAuthenticated={isAuthenticated} />
      </main>
      <PublicFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden dot-grid noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex mb-6 animate-fade-up">
          <span className="chip chip-dark">Use cases</span>
        </div>

        <h1
          className="hero-headline text-balance animate-fade-up delay-100 mx-auto"
          style={{ color: "var(--hero-fg)", maxWidth: "18ch" }}
        >
          Built for every
          <br />
          <span className="text-gradient">type of brand</span>
        </h1>

        <p
          className="section-subheadline mt-6 animate-fade-up delay-200 mx-auto"
          style={{ textAlign: "center" }}
        >
          From e-commerce to media to SaaS — Storywidget fits how you already work.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  USE CASE CARDS                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const USE_CASES = [
  {
    colorBar: "linear-gradient(to right, #6366f1, #8b5cf6)",
    icon: ShoppingBag,
    title: "E-commerce & DTC",
    desc: "Turn product launches and promotions into interactive stories. Shoppable CTAs drive visitors directly to product pages.",
    items: ["Product launch stories", "Shoppable CTA buttons", "Seasonal promotions", "User-generated content"],
  },
  {
    colorBar: "linear-gradient(to right, #8b5cf6, #ec4899)",
    icon: Newspaper,
    title: "Media & Content",
    desc: "Package editorial content as immersive story experiences. Increase session time and article engagement.",
    items: ["Breaking news stories", "Article highlights", "Video series", "Newsletter previews"],
  },
  {
    colorBar: "linear-gradient(to right, #3b82f6, #06b6d4)",
    icon: Zap,
    title: "SaaS & Tech",
    desc: "Onboard users, announce features, and showcase use cases with in-app story widgets that drive activation.",
    items: ["Onboarding flows", "Feature announcements", "Customer success stories", "Tutorial series"],
  },
  {
    colorBar: "linear-gradient(to right, #f97316, #f59e0b)",
    icon: Building2,
    title: "Agencies & Creators",
    desc: "Build story widgets for multiple clients from one dashboard. Separate categories per brand, all in one workspace.",
    items: ["Multi-brand management", "Client reporting", "White-label ready", "Custom fonts per brand"],
  },
] as const;

function UseCaseCardsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {USE_CASES.map((uc) => {
          const Icon = uc.icon;
          return (
            <div
              key={uc.title}
              style={{
                background: "var(--hero-card)",
                border: "1px solid var(--hero-border)",
                borderRadius: "1.25rem",
                overflow: "hidden",
              }}
            >
              <div style={{ height: "4px", width: "100%", background: uc.colorBar }} />
              <div className="p-8">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "0.75rem",
                    background: "var(--gradient-brand-subtle)",
                  }}
                >
                  <Icon size={22} style={{ color: "oklch(0.62 0.19 265)" }} />
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: "var(--hero-fg)" }}>
                  {uc.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--hero-muted)" }}>
                  {uc.desc}
                </p>
                <ul className="space-y-2">
                  {uc.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--hero-fg)" }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RESULTS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "3×",      label: "Average CTR vs static banners" },
  { value: "< 1min",  label: "Time to embed on any site"     },
  { value: "100%",    label: "Stripe-secured payments"       },
] as const;

function ResultsSection() {
  return (
    <section className="py-20 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex mb-4">
          <span className="chip chip-dark">Results</span>
        </div>
        <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
          Why brands choose Storywidget
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {STATS.map((s) => (
            <div key={s.label} className="glass-card p-8 text-center">
              <div className="text-gradient text-5xl font-bold">{s.value}</div>
              <p className="text-sm mt-2" style={{ color: "var(--hero-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CTA BANNER                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function CtaBannerSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="py-24 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="relative rounded-3xl overflow-hidden noise-overlay p-14 border"
          style={{
            background: "linear-gradient(135deg, oklch(0.22 0.06 265) 0%, oklch(0.17 0.04 275) 100%)",
            borderColor: "oklch(0.32 0.06 265)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 265 / 0.22) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="section-headline mb-4" style={{ color: "var(--hero-fg)" }}>
              Ready to grow your engagement?
            </h2>
            <p
              className="text-base leading-relaxed mb-8 mx-auto"
              style={{ color: "var(--hero-muted)", maxWidth: "38ch" }}
            >
              Join hundreds of brands using Storywidget to create richer,
              more interactive content experiences.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="brand" size="lg" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Go to dashboard" : "Start for free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost-dark"
                size="lg"
                asChild
                className="border"
                style={{ borderColor: "oklch(0.38 0.05 265)" }}
              >
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FOOTER                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function PublicFooter() {
  return (
    <footer
      className="border-t py-12 px-6"
      style={{ borderColor: "var(--hero-border)", background: "oklch(0.09 0.020 265)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base" style={{ color: "var(--hero-fg)" }}>Storywidget</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.58 0.014 265)" }}>
              Create, publish, and embed interactive story widgets on any website.
              Track engagement in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "oklch(0.58 0.014 265)" }}>
                Product
              </p>
              <ul className="space-y-2">
                {[
                  { to: "/features",   label: "Features"    },
                  { to: "/use-cases",  label: "Use Cases"   },
                  { to: "/developers", label: "Developers"  },
                  { to: "/pricing",    label: "Pricing"     },
                  { to: "/register",   label: "Get started" },
                  { to: "/login",      label: "Sign in"     },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm transition-colors"
                      style={{ color: "oklch(0.62 0.014 265)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--hero-fg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.62 0.014 265)")}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t"
          style={{ borderColor: "oklch(0.16 0.018 265)" }}
        >
          <p className="text-xs" style={{ color: "oklch(0.52 0.012 265)" }}>
            © {new Date().getFullYear()} Storywidget. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { to: "/pricing",  label: "Pricing"  },
              { to: "/login",    label: "Sign in"  },
              { to: "/register", label: "Register" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs transition-colors"
                style={{ color: "oklch(0.56 0.012 265)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--hero-fg)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.56 0.012 265)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
