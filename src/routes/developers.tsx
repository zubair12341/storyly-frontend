import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Key, Globe, Zap, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/developers")({
  component: DevelopersPage,
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
          <Link to="/use-cases"  className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Use Cases</Link>
          <Link
            to="/developers"
            className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: '#fff', opacity: 1, borderBottom: '2px solid oklch(0.62 0.22 265)' }}
          >
            Developers
          </Link>
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
function DevelopersPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--hero-bg)" }}>
      <PublicNav />
      <main className="flex-1">
        <HeroSection />
        <CodePreviewSection />
        <ApiFeaturesSection />
        <AttributesSection />
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
          <span className="chip chip-dark">For developers</span>
        </div>

        <h1
          className="hero-headline text-balance animate-fade-up delay-100 mx-auto"
          style={{ color: "var(--hero-fg)", maxWidth: "20ch" }}
        >
          Embed in minutes,
          <br />
          <span className="text-gradient">customise forever</span>
        </h1>

        <p
          className="section-subheadline mt-6 animate-fade-up delay-200 mx-auto"
          style={{ textAlign: "center" }}
        >
          A dead-simple script tag for quick starts. A full REST API for teams who want control.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center animate-fade-up delay-300">
          <Button variant="brand" size="lg" asChild>
            <Link to="/resources">
              Read the docs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            asChild
            className="border"
            style={{ borderColor: "var(--hero-border)" }}
          >
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CODE PREVIEW                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const QUICK_STEPS = [
  {
    num: 1,
    title: "Create an API key",
    desc: "Go to API Keys and generate your workspace key.",
  },
  {
    num: 2,
    title: "Add the script",
    desc: "Paste one line of HTML before </body>.",
  },
  {
    num: 3,
    title: "You're live",
    desc: "Stories appear instantly. No build step needed.",
  },
] as const;

function CodePreviewSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex mb-4">
            <span className="chip chip-dark">Quick start</span>
          </div>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            One snippet. Any website.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 items-center">
          {/* Steps */}
          <div className="flex flex-col gap-8">
            {QUICK_STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 items-start">
                <div
                  className="flex items-center justify-center font-bold text-white flex-shrink-0"
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
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--hero-fg)" }}>
                    {s.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--hero-muted)" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Code block */}
          <div
            className="rounded-2xl p-6 overflow-x-auto"
            style={{
              background: "oklch(0.08 0.015 265)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--hero-fg)",
            }}
          >
            <pre className="whitespace-pre-wrap leading-relaxed">
              <span style={{ color: "oklch(0.5 0.01 265)" }}>{`/* Install via npm (optional) */`}</span>
              {"\n"}
              {`npm install storywidget`}
              {"\n\n"}
              <span style={{ color: "oklch(0.5 0.01 265)" }}>{`/* Or use the script tag */`}</span>
              {"\n"}
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`<`}</span>
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`script`}</span>
              {"\n  "}
              <span style={{ color: "oklch(0.72 0.15 220)" }}>{`src`}</span>
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`=`}</span>
              <span style={{ color: "oklch(0.78 0.13 55)" }}>{`"https://cdn.storywidget.io/widget.js"`}</span>
              {"\n  "}
              <span style={{ color: "oklch(0.72 0.15 220)" }}>{`data-api-key`}</span>
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`=`}</span>
              <span style={{ color: "oklch(0.78 0.13 55)" }}>{`"swp_live_••••••••"`}</span>
              {"\n  "}
              <span style={{ color: "oklch(0.72 0.15 220)" }}>{`data-category`}</span>
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`=`}</span>
              <span style={{ color: "oklch(0.78 0.13 55)" }}>{`"your-category"`}</span>
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`>`}</span>
              {"\n"}
              <span style={{ color: "oklch(0.62 0.17 152)" }}>{`</script>`}</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  API FEATURES                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const API_CARDS = [
  {
    icon: Key,
    title: "API Key auth",
    desc: "Every request authenticates via your API key in the x-api-key header. Domain restrictions enforced server-side.",
  },
  {
    icon: Globe,
    title: "Widget endpoints",
    desc: "Fetch stories by category, track events, and serve the widget from any client-side or server-side context.",
  },
  {
    icon: Zap,
    title: "Webhooks via Stripe",
    desc: "Billing events (subscription created, cancelled, payment failed) are handled automatically via Stripe webhooks.",
  },
  {
    icon: Lock,
    title: "Secure by default",
    desc: "All endpoints use HTTPS. API keys are hashed with bcrypt. Domain allowlisting prevents unauthorized embeds.",
  },
] as const;

function ApiFeaturesSection() {
  return (
    <section className="py-20 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex mb-4">
            <span className="chip chip-dark">REST API</span>
          </div>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Full API access on all plans
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {API_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
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
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--hero-muted)" }}>
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ATTRIBUTES REFERENCE                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const ATTRIBUTES = [
  { attr: "data-api-key",    required: true,  desc: "Your workspace API key from the dashboard" },
  { attr: "data-category",   required: false, desc: "Category slug — omit to show all stories" },
  { attr: "data-container",  required: false, desc: "CSS selector for mount point. Default: #story-widget" },
  { attr: "data-limit",      required: false, desc: "Max number of stories to display" },
  { attr: "data-api-url",    required: false, desc: "Override API base URL (for self-hosted setups)" },
] as const;

function AttributesSection() {
  return (
    <section className="py-20 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex mb-4">
            <span className="chip chip-dark">Reference</span>
          </div>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Script tag attributes
          </h2>
        </div>

        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--hero-border)" }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_1fr_3fr] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "oklch(0.13 0.020 265)", color: "var(--hero-muted)" }}
          >
            <span>Attribute</span>
            <span>Required</span>
            <span>Description</span>
          </div>

          {ATTRIBUTES.map((row, i) => (
            <div
              key={row.attr}
              className="grid grid-cols-[2fr_1fr_3fr] gap-4 px-5 py-4 items-center"
              style={{
                background: i % 2 === 0 ? "var(--hero-card)" : "oklch(0.115 0.022 265 / 0.4)",
                borderTop: "1px solid var(--hero-border)",
              }}
            >
              <code
                className="text-sm font-mono"
                style={{ color: "oklch(0.72 0.15 220)" }}
              >
                {row.attr}
              </code>
              <span>
                <Badge variant={row.required ? "default" : "secondary"}>
                  {row.required ? "Required" : "Optional"}
                </Badge>
              </span>
              <span className="text-sm" style={{ color: "var(--hero-muted)" }}>
                {row.desc}
              </span>
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
