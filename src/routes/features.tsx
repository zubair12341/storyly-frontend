import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Layers, MousePointerClick, BarChart3,
  Code2, Palette, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
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
          <Link
                to="/features"
                className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                style={{ color: '#fff', opacity: 1, borderBottom: '2px solid oklch(0.62 0.22 265)' }}
            >
                Features
            </Link>
          <Link to="/use-cases"  className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Use Cases</Link>
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
function FeaturesPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--hero-bg)" }}>
      <PublicNav />
      <main className="flex-1">
        <HeroSection isAuthenticated={isAuthenticated} />
        <FeaturesGrid />
        <HowItWorksSection />
        <IntegrationsSection />
        <CtaBannerSection isAuthenticated={isAuthenticated} />
      </main>
      <PublicFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden dot-grid noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex mb-6 animate-fade-up">
          <span className="chip chip-dark">Product features</span>
        </div>

        <h1
          className="hero-headline text-balance animate-fade-up delay-100 mx-auto"
          style={{ color: "var(--hero-fg)", maxWidth: "18ch" }}
        >
          Everything you need to
          <br />
          <span className="text-gradient">tell your story</span>
        </h1>

        <p
          className="section-subheadline mt-6 animate-fade-up delay-200 mx-auto"
          style={{ textAlign: "center" }}
        >
          A complete story widget platform built for marketers, developers, and growing e-commerce brands.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center animate-fade-up delay-300">
          <Button variant="brand" size="lg" asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            asChild
            className="border"
            style={{ borderColor: "var(--hero-border)" }}
          >
            <Link to="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FEATURES GRID                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Layers,
    title: "Multi-slide Stories",
    desc: "Create stories with unlimited slides — images, video, and rich HTML. Each slide auto-advances or waits for interaction.",
  },
  {
    icon: MousePointerClick,
    title: "CTA Buttons",
    desc: "Add shoppable call-to-action buttons to any slide. Drive traffic to product pages, landing pages, or any URL.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track story views, slide completions, and CTA clicks. Understand exactly what content drives conversions.",
  },
  {
    icon: Code2,
    title: "One-line Embed",
    desc: "Add your widget with a single script tag. Works on any website, CMS, or e-commerce platform — no framework required.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    desc: "Match your brand with custom fonts, card shapes (rounded, square, circle), and per-category visual styles.",
  },
  {
    icon: ShieldCheck,
    title: "Domain Restrictions",
    desc: "Lock your widget to specific domains. Your API key only works on sites you explicitly allowlist — no unauthorized use.",
  },
] as const;

function FeaturesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              style={{
                background: "var(--hero-card)",
                border: "1px solid var(--hero-border)",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "0.75rem",
                  background: "var(--gradient-brand-subtle)",
                }}
              >
                <Icon size={20} style={{ color: "oklch(0.62 0.19 265)" }} />
              </div>
              <h3 className="font-semibold mt-3 mb-1" style={{ color: "var(--hero-fg)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--hero-muted)" }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HOW IT WORKS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: 1,
    title: "Create your story",
    desc: "Use the drag-and-drop editor to build slides with images, video, and CTAs. Publish when ready.",
  },
  {
    num: 2,
    title: "Get your embed code",
    desc: "Copy your unique script tag from the Integration page. It includes your API key and category slug.",
  },
  {
    num: 3,
    title: "Go live instantly",
    desc: "Paste the snippet on any page. The widget appears immediately — no build step, no deployment.",
  },
] as const;

function HowItWorksSection() {
  return (
    <section className="py-20 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex mb-4">
          <span className="chip chip-dark">How it works</span>
        </div>
        <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
          Live in three steps
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mt-12">
          {STEPS.map((s) => (
            <div key={s.num} className="flex-1 text-left">
              <div
                className="flex items-center justify-center font-bold text-white"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "9999px",
                  background: "var(--gradient-brand)",
                  fontSize: "1rem",
                }}
              >
                {s.num}
              </div>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: "var(--hero-fg)" }}>
                {s.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--hero-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  INTEGRATIONS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const PLATFORMS = [
  "Shopify", "WordPress", "Webflow", "Next.js",
  "React", "Vue", "Nuxt", "Framer", "Wix", "Squarespace",
] as const;

function IntegrationsSection() {
  return (
    <section className="py-20 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex mb-4">
          <span className="chip chip-dark">Works everywhere</span>
        </div>
        <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
          Integrates with your stack
        </h2>
        <p className="section-subheadline mt-4 mx-auto" style={{ textAlign: "center" }}>
          One script tag works on any platform.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {PLATFORMS.map((p) => (
            <span key={p} className="chip chip-dark text-sm">
              {p}
            </span>
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
