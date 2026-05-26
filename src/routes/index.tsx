import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Zap, ChevronRight, Star, Play,
  Globe, BookOpen, BarChart3, Code2, Tag, KeyRound,
  CheckCircle2, Layers, ShoppingBag, Newspaper, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface AuthProps {
  isAuthenticated: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page shell                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--hero-bg)" }}>
      <PublicNav isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <HeroSection       isAuthenticated={isAuthenticated} />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <IntegrationSection />
        <StatsSection />
        <CtaBannerSection  isAuthenticated={isAuthenticated} />
      </main>
      <PublicFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NAV                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function PublicNav({ isAuthenticated }: AuthProps) {
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
            to="/pricing"
            className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
          >
            Pricing
          </Link>
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
/*  HERO                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function HeroSection({ isAuthenticated }: AuthProps) {
  return (
    <section className="relative overflow-hidden dot-grid noise-overlay">
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, oklch(0.52 0.24 265 / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, oklch(0.62 0.18 290 / 0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex mb-6 animate-fade-up">
          <span className="chip chip-dark">
            <Zap className="h-3 w-3" style={{ color: "oklch(0.75 0.18 265)" }} />
            Now with real-time analytics
            <ChevronRight className="h-3 w-3 opacity-60" />
          </span>
        </div>

        <h1
          className="hero-headline text-balance animate-fade-up delay-100 mx-auto"
          style={{ color: "var(--hero-fg)", maxWidth: "16ch" }}
        >
          Interactive stories that{" "}
          <span className="text-gradient">drive engagement</span>
        </h1>

        <p
          className="mt-6 text-lg leading-relaxed animate-fade-up delay-200 mx-auto"
          style={{ color: "var(--hero-muted)", maxWidth: "42ch" }}
        >
          Embed shoppable story widgets on any website in minutes.
          Create, publish, and track — all from one dashboard.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center animate-fade-up delay-300">
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
            style={{ borderColor: "var(--hero-border)" }}
          >
            <Link to="/pricing">View pricing</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5 animate-fade-up delay-400">
          <div className="flex -space-x-2">
            {(["#6366f1","#8b5cf6","#a78bfa","#c4b5fd"] as const).map((c, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ borderColor: "var(--hero-bg)", background: c }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5" style={{ color: "var(--hero-muted)" }}>
            <div className="flex">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm">Trusted by 500+ teams</span>
          </div>
        </div>

        {/* Widget mock */}
        <div className="mt-16 animate-fade-up delay-500">
          <div
            className="relative mx-auto rounded-2xl overflow-hidden border"
            style={{ maxWidth: 780, borderColor: "var(--hero-border)", background: "var(--hero-card)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--hero-border)" }}>
              {(["#ff5f56","#ffbd2e","#27c93f"] as const).map((c, i) => (
                <div key={i} className="h-3 w-3 rounded-full" style={{ background: c }} />
              ))}
              <div
                className="flex-1 mx-3 h-6 rounded-md flex items-center px-3"
                style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid var(--hero-border)" }}
              >
                <Globe className="h-3 w-3 mr-2 opacity-40" style={{ color: "var(--hero-muted)" }} />
                <span className="text-xs" style={{ color: "var(--hero-muted)" }}>yourstore.com</span>
              </div>
            </div>
            <div className="p-6 pb-0">
              <div className="mb-5 space-y-2">
                <div className="h-4 rounded-full w-2/5" style={{ background: "oklch(1 0 0 / 0.08)" }} />
                <div className="h-3 rounded-full w-3/5" style={{ background: "oklch(1 0 0 / 0.05)" }} />
              </div>
              <div
                className="rounded-xl p-4 border"
                style={{ background: "oklch(1 0 0 / 0.03)", borderColor: "var(--hero-border)" }}
              >
                <p className="text-xs font-semibold mb-3 text-left" style={{ color: "var(--hero-muted)" }}>
                  Featured Stories
                </p>
                <div className="flex gap-3 overflow-hidden">
                  {(
                    [
                      { label: "New Drop",   from: "#6366f1", to: "#a855f7" },
                      { label: "Summer '25", from: "#f472b6", to: "#ef4444" },
                      { label: "Our Story",  from: "#06b6d4", to: "#3b82f6" },
                      { label: "Collab",     from: "#f59e0b", to: "#f97316" },
                    ] as const
                  ).map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className="w-16 h-24 rounded-xl shadow-md flex flex-col justify-end p-2 cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(160deg, ${s.from}, ${s.to})`,
                          boxShadow: `0 4px 16px -4px ${s.from}66`,
                        }}
                      >
                        <div className="flex gap-0.5 mb-1">
                          {[1,2,3].map((i) => (
                            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/60" />
                          ))}
                        </div>
                        <div className="flex items-center justify-center">
                          <Play className="h-4 w-4 text-white/80" fill="white" />
                        </div>
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--hero-muted)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="h-16 -mt-2"
              style={{ background: "linear-gradient(to bottom, transparent, var(--hero-card))" }}
            />
          </div>
          <p className="text-xs mt-3" style={{ color: "oklch(0.58 0.015 265)" }}>
            ↑ Live preview of the Storywidget embed on your site
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LOGO BAR                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const PLATFORM_NAMES = [
  "Shopify","WordPress","Webflow","Next.js","React","Wix","Squarespace","Framer",
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FEATURES                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: BookOpen, color: "#6366f1", title: "Story Editor",
    description: "Build stunning stories with a visual editor. Add images, videos, CTAs, and links across multiple slides — no design skills needed.",
    points: ["Multi-slide support", "Image & video upload", "CTA buttons"],
  },
  {
    icon: BarChart3, color: "#8b5cf6", title: "Real-Time Analytics",
    description: "Track every view, click, and completion in real time. Understand what content resonates and optimise stories for conversion.",
    points: ["View & click tracking", "Completion rates", "Timeline charts"],
  },
  {
    icon: Code2, color: "#a78bfa", title: "One-Line Embed",
    description: "Drop a single script tag into any site and your widget appears instantly. Works with Shopify, WordPress, Webflow, or raw HTML.",
    points: ["Single script tag", "npm package", "Zero config"],
  },
  {
    icon: Tag, color: "#c084fc", title: "Categories",
    description: "Organise stories into categories with custom card shapes, fonts, and styles. Each category gets its own unique embed code.",
    points: ["Custom fonts", "Card shapes", "Per-category embed"],
  },
  {
    icon: KeyRound, color: "#818cf8", title: "API Access",
    description: "Power your own integrations with a REST API. Create, update, and query stories programmatically with full token-based auth.",
    points: ["REST API", "Token auth", "Full CRUD"],
  },
  {
    icon: Globe, color: "#6366f1", title: "Domain Control",
    description: "Lock your widget to specific domains for security. Your embed code only works where you allow it — preventing unauthorised use.",
    points: ["Domain allowlist", "Security control", "Workspace scoped"],
  },
] as const;

function FeaturesSection() {
  return (
    <section className="relative py-24 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand-subtle" className="mb-4">Platform features</Badge>
          <h2 className="section-headline text-balance" style={{ color: "var(--hero-fg)" }}>
            Everything in one platform
          </h2>
          <p className="section-subheadline mt-4 mx-auto" style={{ textAlign: "center" }}>
            From story creation to analytics to embed — every tool you need to build
            and measure interactive content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--hero-card)", borderColor: "var(--hero-border)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${f.color}40`;
                  el.style.boxShadow = `0 0 0 1px ${f.color}20, 0 8px 24px -8px ${f.color}30`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--hero-border)";
                  el.style.boxShadow = "";
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}28` }}
                >
                  <Icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--hero-fg)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--hero-muted)" }}>{f.description}</p>
                <ul className="space-y-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.55 0.015 265)" }}>
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: f.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HOW IT WORKS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  { num: "01", title: "Create your stories",       body: "Use the visual editor to build multi-slide stories with images, video, and call-to-action buttons.",                    icon: BookOpen  },
  { num: "02", title: "Organise into categories",  body: "Group stories into categories with custom branding. Each category gets its own embed snippet.",                         icon: Layers    },
  { num: "03", title: "Embed with one line",        body: "Paste your script tag into any website or platform. The widget renders instantly — no build step.",                    icon: Code2     },
  { num: "04", title: "Track performance",          body: "Watch views, clicks, and engagement roll in on your analytics dashboard in real time.",                                 icon: BarChart3 },
] as const;

function HowItWorksSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand-subtle" className="mb-4">How it works</Badge>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Live in four steps
          </h2>
          <p className="section-subheadline mt-4 mx-auto" style={{ textAlign: "center" }}>
            Most teams go from sign-up to live widget in under 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-7 left-full w-6 h-px z-10"
                    style={{ background: "var(--hero-border)" }}
                  />
                )}
                <div
                  className="rounded-2xl p-6 h-full border"
                  style={{ background: "var(--hero-card)", borderColor: "var(--hero-border)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--gradient-brand-subtle)",
                        border: "1px solid oklch(0.52 0.24 265 / 0.20)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "oklch(0.72 0.18 265)" }} />
                    </div>
                    <span className="text-xs font-mono font-semibold" style={{ color: "oklch(0.52 0.24 265)" }}>
                      {s.num}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--hero-fg)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--hero-muted)" }}>{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  USE CASES                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const USE_CASES = [
  {
    icon: ShoppingBag,
    color: "#f472b6",
    category: "E-commerce",
    headline: "Shoppable stories for your store",
    body: "Showcase products with swipeable stories. Add buy-now CTAs directly inside the widget — turn browsers into buyers without leaving the page.",
    tags: ["Product drops", "Seasonal sales", "New arrivals"],
  },
  {
    icon: Newspaper,
    color: "#60a5fa",
    category: "Media & Publishing",
    headline: "Story-first content experiences",
    body: "Package editorial content, interviews, and breaking news into bite-sized swipeable cards that keep readers engaged longer.",
    tags: ["News bites", "Interviews", "Long-form"],
  },
  {
    icon: Rocket,
    color: "#34d399",
    category: "SaaS & Tech",
    headline: "Onboarding and feature tours",
    body: "Guide new users through your product with interactive story walkthroughs embedded right where they need it — inside the app.",
    tags: ["Onboarding", "Feature tours", "Changelogs"],
  },
] as const;

function UseCasesSection() {
  return (
    <section className="py-24 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand-subtle" className="mb-4">Use cases</Badge>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Built for every team
          </h2>
          <p className="section-subheadline mt-4 mx-auto" style={{ textAlign: "center" }}>
            Whether you're selling products, publishing content, or onboarding users —
            Storywidget adapts to your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USE_CASES.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.category}
                className="rounded-2xl p-7 border flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--hero-card)", borderColor: "var(--hero-border)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${u.color}35`;
                  el.style.boxShadow = `0 8px 24px -8px ${u.color}25`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--hero-border)";
                  el.style.boxShadow = "";
                }}
              >
                {/* Icon + label row */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${u.color}18`, border: `1px solid ${u.color}28` }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: u.color }} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: u.color }}>
                    {u.category}
                  </span>
                </div>

                <h3 className="font-bold text-base leading-snug" style={{ color: "var(--hero-fg)" }}>
                  {u.headline}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--hero-muted)" }}>
                  {u.body}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {u.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                      style={{
                        color: u.color,
                        borderColor: `${u.color}30`,
                        background: `${u.color}10`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  INTEGRATION                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function IntegrationSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left copy */}
          <div>
            <Badge variant="brand-subtle" className="mb-4">Integration</Badge>
            <h2 className="section-headline mb-5" style={{ color: "var(--hero-fg)" }}>
              One script tag.<br />Any website.
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "var(--hero-muted)" }}>
              No build tools, no npm installs required. Paste the snippet and your
              story widget renders instantly — across Shopify, WordPress, Webflow,
              Next.js, or raw HTML.
            </p>
            <ul className="space-y-3">
              {[
                "Works with any CMS or framework",
                "Domain-locked for security",
                "npm package available for React apps",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--hero-muted)" }}>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "oklch(0.62 0.17 152)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right code block */}
          <div>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--hero-border)" }}>
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ background: "oklch(0.13 0.020 265)", borderColor: "var(--hero-border)" }}
              >
                {(["#ff5f56","#ffbd2e","#27c93f"] as const).map((c, i) => (
                  <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                ))}
                <span className="ml-2 text-xs" style={{ color: "oklch(0.58 0.014 265)" }}>
                  index.html
                </span>
              </div>

              {/* Code */}
              <pre
                className="p-5 text-sm leading-7 overflow-x-auto"
                style={{
                  background: "oklch(0.10 0.018 265)",
                  color: "oklch(0.80 0.025 265)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <code>
                  <span style={{ color: "#a78bfa" }}>{"<script"}</span>
                  {"\n  "}
                  <span style={{ color: "#93c5fd" }}>src</span>
                  <span style={{ color: "oklch(0.70 0.015 265)" }}>{"="}</span>
                  <span style={{ color: "#86efac" }}>{'"https://cdn.storywidget.io/widget.js"'}</span>
                  {"\n  "}
                  <span style={{ color: "#93c5fd" }}>data-api-key</span>
                  <span style={{ color: "oklch(0.70 0.015 265)" }}>{"="}</span>
                  <span style={{ color: "#86efac" }}>{'"sw_live_xxxxxxxxxxxx"'}</span>
                  {"\n  "}
                  <span style={{ color: "#93c5fd" }}>data-category</span>
                  <span style={{ color: "oklch(0.70 0.015 265)" }}>{"="}</span>
                  <span style={{ color: "#86efac" }}>{'"featured"'}</span>
                  {"\n"}
                  <span style={{ color: "#a78bfa" }}>{"></script>"}</span>
                </code>
              </pre>
            </div>

            {/* npm alt */}
            <div
              className="mt-3 rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--hero-border)" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ background: "oklch(0.13 0.020 265)", borderColor: "var(--hero-border)" }}
              >
                <span className="text-xs" style={{ color: "oklch(0.58 0.014 265)" }}>terminal</span>
              </div>
              <pre
                className="px-5 py-3 text-sm"
                style={{
                  background: "oklch(0.10 0.018 265)",
                  color: "oklch(0.80 0.025 265)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span style={{ color: "oklch(0.55 0.015 265)" }}>$ </span>
                <span style={{ color: "#86efac" }}>npm install</span>
                {" storywidget"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  STATS                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "500+",  label: "Teams using Storywidget" },
  { value: "12M+",  label: "Story views served"       },
  { value: "4.2×",  label: "Average engagement lift"  },
  { value: "< 10m", label: "Time to first live widget" },
] as const;

function StatsSection() {
  return (
    <section
      className="py-20 px-6 border-y"
      style={{ background: "oklch(0.115 0.022 265)", borderColor: "var(--hero-border)" }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="stat-number text-gradient mb-1">{s.value}</div>
            <p className="text-sm" style={{ color: "var(--hero-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CTA BANNER                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function CtaBannerSection({ isAuthenticated }: AuthProps) {
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
          {/* Radial glow top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 265 / 0.22) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10">
            <Badge variant="dark" className="mb-5">Get started today</Badge>
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
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand col */}
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

          {/* Link columns */}
          <div className="flex flex-wrap gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "oklch(0.58 0.014 265)" }}>
                Product
              </p>
              <ul className="space-y-2">
                {[
                  { to: "/pricing",  label: "Pricing"     },
                  { to: "/register", label: "Get started" },
                  { to: "/login",    label: "Sign in"     },
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

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "oklch(0.58 0.014 265)" }}>
                Features
              </p>
              <ul className="space-y-2">
                {[
                  "Story Editor",
                  "Analytics",
                  "Embed",
                  "API Access",
                ].map((label) => (
                  <li key={label}>
                    <span className="text-sm" style={{ color: "oklch(0.62 0.014 265)" }}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t"
          style={{ borderColor: "oklch(0.16 0.018 265)" }}
        >
          <p className="text-xs" style={{ color: "oklch(0.52 0.012 265)" }}>
            © {new Date().getFullYear()} Storywidget. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { to: "/pricing",  label: "Pricing"     },
              { to: "/login",    label: "Sign in"     },
              { to: "/register", label: "Register"    },
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