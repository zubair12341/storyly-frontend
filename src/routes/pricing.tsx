import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  X,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { plansApi, billingApi, type PublicPlanConfig } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const UNLIMITED = 2147483647;

const FALLBACK_PLANS: PublicPlanConfig[] = [
  {
    id: "f2",
    plan_id: "pro",
    display_name: "Pro",
    price_monthly: 2900,
    max_stories: 50,
    max_monthly_views: 50000,
    max_allowed_domains: 3,
    is_active: true,
    sort_order: 1,
    features: [
      "50 stories",
      "50,000 monthly views",
      "Advanced analytics",
      "Widget embed",
      "Custom branding",
      "Priority support",
    ],
  },
  {
    id: "f3",
    plan_id: "business",
    display_name: "Business",
    price_monthly: 9900,
    max_stories: UNLIMITED,
    max_monthly_views: UNLIMITED,
    max_allowed_domains: 10,
    is_active: true,
    sort_order: 2,
    features: [
      "Unlimited stories",
      "Unlimited views",
      "Advanced analytics",
      "Widget embed",
      "Custom branding",
      "Priority support",
      "SLA support",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function formatLimit(val: number): string {
  if (val >= UNLIMITED) return "Unlimited";
  return val.toLocaleString();
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page shell                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function PricingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<PublicPlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    plansApi
      .list()
      .then((data) =>
        setPlans(
          data
            .filter((p) => p.plan_id !== "free")
            .sort((a, b) => a.sort_order - b.sort_order),
        ),
      )
      .catch(() => setPlans(FALLBACK_PLANS))
      .finally(() => setLoading(false));
  }, []);

  function handleCheckout(planId: string) {
    if (!isAuthenticated) {
      navigate({ to: "/register" });
      return;
    }
    setCheckoutLoading(planId);
    billingApi
      .createCheckoutSession(planId)
      .then((r) => {
        window.location.href = r.url;
      })
      .catch(() => {
        toast.error("Failed to start checkout.");
        setCheckoutLoading(null);
      });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--hero-bg)" }}>
      <PublicNav isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <PricingHeroSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
        <PlansSection
          plans={plans}
          loading={loading}
          billingCycle={billingCycle}
          checkoutLoading={checkoutLoading}
          onCheckout={handleCheckout}
        />
        <ComparisonTableSection plans={plans} loading={loading} />
        <FaqSection />
        <CtaBannerSection isAuthenticated={isAuthenticated} />
      </main>
      <PublicFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NAV                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
interface AuthProps {
  isAuthenticated: boolean;
}

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
            style={{
              color: "var(--hero-fg)",
              borderBottom: "2px solid oklch(0.62 0.22 265)",
            }}
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
interface PricingHeroProps {
  billingCycle: "monthly" | "annual";
  setBillingCycle: (c: "monthly" | "annual") => void;
}

function PricingHeroSection({ billingCycle, setBillingCycle }: PricingHeroProps) {
  return (
    <section className="relative overflow-hidden dot-grid noise-overlay">
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.52 0.24 265 / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.62 0.18 290 / 0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex mb-6 animate-fade-up">
          <span className="chip chip-dark">
            <Zap className="h-3 w-3" style={{ color: "oklch(0.75 0.18 265)" }} />
            Simple, transparent pricing
          </span>
        </div>

        <h1
          className="hero-headline text-balance animate-fade-up delay-100 mx-auto"
          style={{ color: "var(--hero-fg)", maxWidth: "16ch" }}
        >
          The right plan for
          <br />
          <span className="text-gradient">your growth</span>
        </h1>

        <p
          className="mt-6 text-lg leading-relaxed animate-fade-up delay-200 mx-auto"
          style={{ color: "var(--hero-muted)", maxWidth: "46ch" }}
        >
          Start with Pro. Scale to Business when you're ready. No hidden fees.
        </p>

        {/* Billing toggle */}
        <div className="mt-10 flex justify-center animate-fade-up delay-300">
          <div
            className="inline-flex rounded-xl p-1 gap-1"
            style={{
              background: "oklch(0.13 0.022 265)",
              border: "1px solid var(--hero-border)",
            }}
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                billingCycle === "monthly"
                  ? {
                      background: "oklch(0.22 0.04 265)",
                      color: "var(--hero-fg)",
                      boxShadow: "0 1px 4px oklch(0 0 0 / 0.35)",
                    }
                  : { color: "var(--hero-muted)" }
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className="px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={
                billingCycle === "annual"
                  ? {
                      background: "oklch(0.22 0.04 265)",
                      color: "var(--hero-fg)",
                      boxShadow: "0 1px 4px oklch(0 0 0 / 0.35)",
                    }
                  : { color: "var(--hero-muted)" }
              }
            >
              Annual
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PLANS                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
interface PlansSectionProps {
  plans: PublicPlanConfig[];
  loading: boolean;
  billingCycle: "monthly" | "annual";
  checkoutLoading: string | null;
  onCheckout: (planId: string) => void;
}

function PlansSection({
  plans,
  loading,
  billingCycle,
  checkoutLoading,
  onCheckout,
}: PlansSectionProps) {
  const colCount = Math.min(plans.length, 3);
  const gridClass =
    colCount === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : colCount === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-8 border"
                style={{ background: "var(--hero-card)", borderColor: "var(--hero-border)" }}
              >
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-12 w-28 mb-6" />
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-8`}>
            {plans.map((plan, idx) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isFeatured={idx === 0}
                billingCycle={billingCycle}
                checkoutLoading={checkoutLoading}
                onCheckout={onCheckout}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface PlanCardProps {
  plan: PublicPlanConfig;
  isFeatured: boolean;
  billingCycle: "monthly" | "annual";
  checkoutLoading: string | null;
  onCheckout: (planId: string) => void;
}

function PlanCard({ plan, isFeatured, billingCycle, checkoutLoading, onCheckout }: PlanCardProps) {
  const monthlyPrice = plan.price_monthly / 100;
  const annualPerMonth = Math.round((plan.price_monthly * 12 * 0.8) / 12) / 100;
  const annualTotal = Math.round(plan.price_monthly * 12 * 0.8) / 100;
  const displayPrice = billingCycle === "monthly" ? monthlyPrice : annualPerMonth;

  return (
    <div
      className="relative rounded-2xl p-8 border flex flex-col"
      style={
        isFeatured
          ? {
              background: "var(--hero-card)",
              borderColor: "var(--hero-border)",
              boxShadow:
                "0 0 0 1px oklch(0.52 0.24 265 / 0.3), 0 20px 60px -12px oklch(0.52 0.24 265 / 0.25)",
            }
          : {
              background: "var(--hero-card)",
              borderColor: "var(--hero-border)",
            }
      }
    >
      {/* Badge */}
      <div className="mb-5">
        {isFeatured ? (
          <Badge variant="brand-subtle">Most popular</Badge>
        ) : (
          <Badge variant="dark">Enterprise</Badge>
        )}
      </div>

      {/* Plan name */}
      <p className="font-bold text-xl mb-4" style={{ color: "var(--hero-fg)" }}>
        {plan.display_name}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1.5">
          <span
            className="text-gradient font-bold leading-none"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.25rem)" }}
          >
            ${displayPrice}
          </span>
          <span className="text-sm mb-2" style={{ color: "var(--hero-muted)" }}>
            /mo
          </span>
        </div>
        {billingCycle === "annual" && (
          <p className="text-xs mt-1" style={{ color: "var(--hero-muted)" }}>
            Billed annually at ${annualTotal}/yr
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <CheckCircle2
              className="h-4 w-4 flex-shrink-0"
              style={{ color: "oklch(0.62 0.17 152)" }}
            />
            <span className="text-sm" style={{ color: "var(--hero-fg)" }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Limits row */}
      <p className="text-xs mb-6" style={{ color: "var(--hero-muted)" }}>
        {formatLimit(plan.max_stories)} stories · {formatLimit(plan.max_monthly_views)} views/mo ·{" "}
        {formatLimit(plan.max_allowed_domains)} domains
      </p>

      {/* CTA */}
      <Button
        variant={isFeatured ? "brand" : "outline-brand"}
        className="w-full"
        disabled={checkoutLoading === plan.plan_id}
        onClick={() => onCheckout(plan.plan_id)}
      >
        {checkoutLoading === plan.plan_id ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading…
          </>
        ) : (
          <>
            Get started
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COMPARISON TABLE — fully dynamic from plans API                            */
/* ─────────────────────────────────────────────────────────────────────────── */

// Rows derived from plan limits — shown for every plan
const LIMIT_ROWS: {
  label: string;
  getValue: (p: PublicPlanConfig) => string;
}[] = [
  { label: "Stories",         getValue: (p) => formatLimit(p.max_stories) },
  { label: "Monthly views",   getValue: (p) => formatLimit(p.max_monthly_views) },
  { label: "Allowed domains", getValue: (p) => String(p.max_allowed_domains) },
];

function CellValue({ val }: { val: string | boolean }) {
  if (val === true) {
    return (
      <CheckCircle2 className="h-5 w-5 mx-auto" style={{ color: "oklch(0.62 0.17 152)" }} />
    );
  }
  if (val === false) {
    return <X className="h-4 w-4 mx-auto" style={{ color: "oklch(0.55 0.015 265)" }} />;
  }
  return (
    <span className="text-sm" style={{ color: "var(--hero-muted)" }}>
      {val}
    </span>
  );
}

interface ComparisonTableProps {
  plans: PublicPlanConfig[];
  loading: boolean;
}

function ComparisonTableSection({ plans, loading }: ComparisonTableProps) {
  if (loading || plans.length === 0) return null;

  // Collect ALL unique feature strings across every plan, preserving first-seen order
  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => p.features)),
  );

  // Grid columns: Feature label + one column per plan
  const colCount = plans.length + 1;
  const gridCols = `grid-cols-[1fr${",1fr".repeat(plans.length)}]`;

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex mb-4">
            <Badge variant="brand-subtle">Details</Badge>
          </div>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Compare plans
          </h2>
        </div>

        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--hero-border)" }}
        >
          {/* Header row */}
          <div
            className={`grid ${gridCols} px-6 py-4`}
            style={{ background: "oklch(0.13 0.020 265)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--hero-fg)" }}>
              Feature
            </span>
            {plans.map((p) => (
              <span
                key={p.plan_id}
                className="text-sm font-semibold text-center"
                style={{ color: "var(--hero-fg)" }}
              >
                {p.display_name}
              </span>
            ))}
          </div>

          {/* Limit rows */}
          {LIMIT_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid ${gridCols} px-6 py-4 items-center`}
              style={{ background: i % 2 === 0 ? "oklch(0.105 0.018 265)" : "transparent" }}
            >
              <span className="text-sm" style={{ color: "var(--hero-muted)" }}>
                {row.label}
              </span>
              {plans.map((p) => (
                <div key={p.plan_id} className="text-center">
                  <CellValue val={row.getValue(p)} />
                </div>
              ))}
            </div>
          ))}

          {/* Feature rows — one row per unique feature string */}
          {allFeatures.map((feature, i) => {
            const rowIdx = LIMIT_ROWS.length + i;
            return (
              <div
                key={feature}
                className={`grid ${gridCols} px-6 py-4 items-center`}
                style={{
                  background:
                    rowIdx % 2 === 0 ? "oklch(0.105 0.018 265)" : "transparent",
                }}
              >
                <span className="text-sm" style={{ color: "var(--hero-muted)" }}>
                  {feature}
                </span>
                {plans.map((p) => (
                  <div key={p.plan_id} className="text-center">
                    <CellValue val={p.features.includes(feature)} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FAQ                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    question: "Can I upgrade or downgrade at any time?",
    answer:
      "Yes. Plan changes take effect immediately with prorated billing. Upgrade mid-cycle and only pay the difference.",
  },
  {
    question: "What happens when I hit my story limit?",
    answer:
      "You'll be prompted to upgrade. Existing published stories remain fully accessible — you just can't create new ones until you upgrade.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "There's no free plan, but you can cancel any time before your next billing date. No lock-in, no hidden fees.",
  },
];

function FaqSection() {
  return (
    <section className="py-20 px-6" style={{ background: "oklch(0.115 0.022 265)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex mb-4">
            <span className="chip chip-dark">FAQ</span>
          </div>
          <h2 className="section-headline" style={{ color: "var(--hero-fg)" }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.question}
              className="rounded-2xl p-6 border"
              style={{
                background: "var(--hero-card)",
                borderColor: "var(--hero-border)",
                gridColumn: i === FAQ_ITEMS.length - 1 ? "1 / -1" : undefined,
              }}
            >
              <h3 className="font-semibold text-base mb-2" style={{ color: "var(--hero-fg)" }}>
                {item.question}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--hero-muted)" }}>
                {item.answer}
              </p>
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
function CtaBannerSection({ isAuthenticated }: AuthProps) {
  return (
    <section className="py-24 px-6" style={{ background: "var(--hero-bg)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="relative rounded-3xl overflow-hidden noise-overlay p-14 border"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 265) 0%, oklch(0.17 0.04 275) 100%)",
            borderColor: "oklch(0.32 0.06 265)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 265 / 0.22) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10">
            <Badge variant="dark" className="mb-5">
              Get started today
            </Badge>
            <h2 className="section-headline mb-4" style={{ color: "var(--hero-fg)" }}>
              Ready to grow your engagement?
            </h2>
            <p
              className="text-base leading-relaxed mb-8 mx-auto"
              style={{ color: "var(--hero-muted)", maxWidth: "38ch" }}
            >
              Join hundreds of brands using Storywidget to create richer, more interactive content
              experiences.
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
              <span className="font-bold text-base" style={{ color: "var(--hero-fg)" }}>
                Storywidget
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.58 0.014 265)" }}>
              Create, publish, and embed interactive story widgets on any website. Track engagement
              in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-10">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "oklch(0.58 0.014 265)" }}
              >
                Product
              </p>
              <ul className="space-y-2">
                {[
                  { to: "/pricing", label: "Pricing" },
                  { to: "/register", label: "Get started" },
                  { to: "/login", label: "Sign in" },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm transition-colors"
                      style={{ color: "oklch(0.62 0.014 265)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "var(--hero-fg)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color =
                          "oklch(0.62 0.014 265)")
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "oklch(0.58 0.014 265)" }}
              >
                Features
              </p>
              <ul className="space-y-2">
                {["Story Editor", "Analytics", "Embed", "API Access"].map((label) => (
                  <li key={label}>
                    <span className="text-sm" style={{ color: "oklch(0.62 0.014 265)" }}>
                      {label}
                    </span>
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
              { to: "/pricing", label: "Pricing" },
              { to: "/login", label: "Sign in" },
              { to: "/register", label: "Register" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs transition-colors"
                style={{ color: "oklch(0.56 0.012 265)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--hero-fg)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.56 0.012 265)")
                }
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