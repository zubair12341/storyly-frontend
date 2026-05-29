import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, X, Sparkles, RefreshCw, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { plansApi, billingApi, type PublicPlanConfig } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const UNLIMITED = 2147483647

const FALLBACK_PLANS: PublicPlanConfig[] = [
  {
    id: 'f2',
    plan_id: 'pro',
    display_name: 'Pro',
    price_monthly: 2900,
    max_stories: 50,
    max_monthly_views: 50000,
    max_allowed_domains: 3,
    is_active: true,
    sort_order: 1,
    features: [
      '50 stories',
      '50,000 monthly views',
      'Advanced analytics',
      'Widget embed',
      'Custom branding',
      'Priority support',
    ],
  },
  {
    id: 'f3',
    plan_id: 'business',
    display_name: 'Business',
    price_monthly: 9900,
    max_stories: UNLIMITED,
    max_monthly_views: UNLIMITED,
    max_allowed_domains: 10,
    is_active: true,
    sort_order: 2,
    features: [
      'Unlimited stories',
      'Unlimited views',
      'Advanced analytics',
      'Widget embed',
      'Custom branding',
      'Priority support',
      'SLA support',
    ],
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function formatLimit(val: number): string {
  if (val >= UNLIMITED) return 'Unlimited'
  return val.toLocaleString()
}

const annualMonthlyPrice = (cents: number) =>
  Math.round((cents * 12 * 0.8) / 12)

const annualTotal = (cents: number) =>
  Math.round(cents * 12 * 0.8)

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
interface AuthProps {
  isAuthenticated: boolean
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page shell                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function PricingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<PublicPlanConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    plansApi
      .list()
      .then((data) =>
        setPlans(
          data
            .filter((p) => p.plan_id !== 'free')
            .sort((a, b) => a.sort_order - b.sort_order),
        ),
      )
      .catch(() => setPlans(FALLBACK_PLANS))
      .finally(() => setLoading(false))
  }, [])

  function handleCheckout(planId: string) {
    if (!isAuthenticated) {
      navigate({ to: '/register' })
      return
    }
    setCheckoutLoading(planId)
    billingApi
      .createCheckoutSession(planId as 'pro' | 'business')
      .then((r) => {
        window.location.href = r.url
      })
      .catch(() => {
        toast.error('Failed to start checkout.')
        setCheckoutLoading(null)
      })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-bg)' }}>
      <PublicNav isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <HeroSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
        <PlansSection
          plans={plans}
          loading={loading}
          billingCycle={billingCycle}
          checkoutLoading={checkoutLoading}
          onCheckout={handleCheckout}
        />
        <ComparisonTableSection />
        <FaqSection />
        <CtaBannerSection isAuthenticated={isAuthenticated} />
      </main>
      <PublicFooter />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NAV — copied exactly from index.tsx, Pricing link made active              */
/* ─────────────────────────────────────────────────────────────────────────── */
function PublicNav({ isAuthenticated }: AuthProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: 'var(--hero-border)',
        background: 'oklch(0.10 0.025 265 / 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--hero-fg)' }}>
            Storywidget
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/features"   className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Features</Link>
          <Link to="/use-cases"  className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Use Cases</Link>
          <Link to="/developers" className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors">Developers</Link>
          <Link
            to="/pricing"
            className="nav-link px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: '#fff', opacity: 1, borderBottom: '2px solid oklch(0.62 0.22 265)' }}
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
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
interface HeroSectionProps {
  billingCycle: 'monthly' | 'annual'
  setBillingCycle: (c: 'monthly' | 'annual') => void
}

function HeroSection({ billingCycle, setBillingCycle }: HeroSectionProps) {
  return (
    <section
      className="relative py-24 px-6 text-center overflow-hidden"
      style={{ background: 'var(--hero-bg)' }}
    >
      {/* Dot grid + noise */}
      <div className="dot-grid" />
      <div className="noise-overlay" />

      {/* Radial glow blob */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, oklch(0.52 0.24 265/0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex mb-4 animate-fade-up">
          <span className="chip chip-dark">
            <Zap className="h-3 w-3" style={{ color: 'oklch(0.75 0.18 265)' }} />
            Simple, transparent pricing
          </span>
        </div>

        <h1
          className="hero-headline mt-4 mb-6 animate-fade-up"
          style={{ color: 'var(--hero-fg)' }}
        >
          The right plan for
          <br />
          <span className="text-gradient">your growth</span>
        </h1>

        <p
          className="section-subheadline max-w-xl mx-auto mb-10 animate-fade-up"
          style={{ color: 'var(--hero-muted)' }}
        >
          Start with Pro. Scale to Business when you're ready.
          No hidden fees, no lock-in.
        </p>

        {/* Monthly / Annual toggle */}
        <div
          className="inline-flex items-center rounded-full p-1 mb-2 animate-fade-up"
          style={{
            background: 'var(--hero-card)',
            border: '1px solid var(--hero-border)',
          }}
        >
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
            <Badge variant="success" className="text-xs py-0">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PLANS                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
interface PlansSectionProps {
  plans: PublicPlanConfig[]
  loading: boolean
  billingCycle: 'monthly' | 'annual'
  checkoutLoading: string | null
  onCheckout: (planId: string) => void
}

function PlansSection({
  plans,
  loading,
  billingCycle,
  checkoutLoading,
  onCheckout,
}: PlansSectionProps) {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--hero-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => {
              const isPro =
                plan.sort_order === 1 || plan.plan_id === 'pro'
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPro={isPro}
                  billingCycle={billingCycle}
                  checkoutLoading={checkoutLoading}
                  onCheckout={onCheckout}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

interface PlanCardProps {
  plan: PublicPlanConfig
  isPro: boolean
  billingCycle: 'monthly' | 'annual'
  checkoutLoading: string | null
  onCheckout: (planId: string) => void
}

function PlanCard({
  plan,
  isPro,
  billingCycle,
  checkoutLoading,
  onCheckout,
}: PlanCardProps) {
  const isLoading = checkoutLoading === plan.plan_id

  return (
    <div className="relative">
      <div
        style={{
          background: 'var(--hero-card)',
          border: '1px solid var(--hero-border)',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: isPro
            ? '0 0 0 1px oklch(0.52 0.24 265/0.3), 0 20px 60px -12px oklch(0.52 0.24 265/0.25)'
            : undefined,
        }}
      >
        {/* Top accent stripe for Pro */}
        {isPro && (
          <div
            className="h-1 w-full"
            style={{ background: 'var(--gradient-brand)' }}
          />
        )}

        <div className="p-8">
          {/* Badge */}
          {isPro ? (
            <Badge variant="brand-subtle" className="mb-4">
              Most popular
            </Badge>
          ) : (
            <Badge variant="dark" className="mb-4">
              Enterprise
            </Badge>
          )}

          {/* Plan name */}
          <p className="text-xl font-bold" style={{ color: 'var(--hero-fg)' }}>
            {plan.display_name}
          </p>

          {/* Price */}
          {billingCycle === 'monthly' ? (
            <>
              <div className="mt-4 mb-1">
                <span
                  className="text-gradient"
                  style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}
                >
                  ${plan.price_monthly / 100}
                </span>
                <span style={{ color: 'var(--hero-muted)' }}>/mo</span>
              </div>
              <p style={{ color: 'var(--hero-muted)', fontSize: '0.8rem' }}>
                Billed monthly
              </p>
            </>
          ) : (
            <>
              <div className="mt-4 mb-1">
                <span
                  className="text-gradient"
                  style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}
                >
                  ${annualMonthlyPrice(plan.price_monthly) / 100}
                </span>
                <span style={{ color: 'var(--hero-muted)' }}>/mo</span>
              </div>
              <p style={{ color: 'var(--hero-muted)', fontSize: '0.8rem' }}>
                Billed annually at ${annualTotal(plan.price_monthly) / 100}/yr
              </p>
            </>
          )}

          {/* Divider */}
          <div
            className="border-t my-6"
            style={{ borderColor: 'var(--hero-border)' }}
          />

          {/* Features */}
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2.5 mb-3">
              <CheckCircle2
                size={16}
                style={{ color: 'oklch(0.62 0.17 152)', flexShrink: 0 }}
              />
              <span style={{ color: 'var(--hero-fg)', fontSize: '0.875rem' }}>
                {f}
              </span>
            </div>
          ))}

          {/* Limits row */}
          <p style={{ color: 'var(--hero-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
            {formatLimit(plan.max_stories)} stories ·{' '}
            {formatLimit(plan.max_monthly_views)} views/mo ·{' '}
            {plan.max_allowed_domains} domains
          </p>

          {/* CTA */}
          {isPro ? (
            <Button
              variant="brand"
              className="w-full mt-6"
              disabled={isLoading}
              onClick={() => onCheckout(plan.plan_id)}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading…
                </>
              ) : (
                <>
                  Get started <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline-brand"
              className="w-full mt-6"
              style={{
                borderColor: 'var(--hero-border)',
                color: 'var(--hero-fg)',
              }}
              disabled={isLoading}
              onClick={() => onCheckout(plan.plan_id)}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading…
                </>
              ) : (
                <>
                  Get started <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COMPARISON TABLE                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
const TABLE_ROWS: {
  feature: string
  pro: string | boolean
  business: string | boolean
}[] = [
  { feature: 'Stories',          pro: '50',        business: 'Unlimited' },
  { feature: 'Monthly views',    pro: '50,000',     business: 'Unlimited' },
  { feature: 'Allowed domains',  pro: '3',          business: '10' },
  { feature: 'Analytics',        pro: 'Advanced',   business: 'Advanced' },
  { feature: 'Custom branding',  pro: true,         business: true },
  { feature: 'API access',       pro: true,         business: true },
  { feature: 'Priority support', pro: true,         business: true },
  { feature: 'SLA support',      pro: false,        business: true },
]

function CellValue({ val }: { val: string | boolean }) {
  if (val === true) {
    return <CheckCircle2 size={16} style={{ color: 'oklch(0.62 0.17 152)', margin: '0 auto' }} />
  }
  if (val === false) {
    return <X size={16} style={{ color: 'oklch(0.45 0.015 265)', margin: '0 auto' }} />
  }
  return (
    <span className="text-sm" style={{ color: 'var(--hero-fg)' }}>
      {val}
    </span>
  )
}

function ComparisonTableSection() {
  return (
    <section className="py-16 px-6" style={{ background: 'oklch(0.115 0.022 265)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <span className="chip chip-dark mb-4">Compare plans</span>
          <h2 className="section-headline" style={{ color: 'var(--hero-fg)' }}>
            Everything you need to grow
          </h2>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden border w-full mt-10"
          style={{ borderColor: 'var(--hero-border)' }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-3 px-6 py-4"
            style={{ background: 'oklch(0.13 0.020 265)' }}
          >
            {['Feature', 'Pro', 'Business'].map((col) => (
              <span
                key={col}
                className="text-xs font-semibold uppercase tracking-widest text-center first:text-left"
                style={{ color: 'var(--hero-muted)' }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Data rows */}
          {TABLE_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 px-6 py-4 items-center"
              style={{
                background: i % 2 === 0 ? 'oklch(0.105 0.018 265)' : 'transparent',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--hero-muted)' }}>
                {row.feature}
              </span>
              <div className="text-center">
                <CellValue val={row.pro} />
              </div>
              <div className="text-center">
                <CellValue val={row.business} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FAQ                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    question: 'Can I upgrade or downgrade at any time?',
    answer:
      'Yes. Plan changes take effect immediately with prorated billing. Upgrade mid-cycle and only pay the difference.',
  },
  {
    question: 'What happens when I hit my story limit?',
    answer:
      "You'll be prompted to upgrade. Existing published stories stay fully accessible — you just can't create new ones.",
  },
  {
    question: 'Is there a free trial?',
    answer:
      "There's no free plan, but you can cancel anytime before your next billing date. No lock-in, no hidden fees.",
  },
]

function FaqSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--hero-bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <span className="chip chip-dark mb-4">FAQ</span>
          <h2 className="section-headline" style={{ color: 'var(--hero-fg)' }}>
            Questions &amp; answers
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.question}
              style={{
                background: 'var(--hero-card)',
                border: '1px solid var(--hero-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                gridColumn:
                  i === FAQ_ITEMS.length - 1 ? 'span 2 / span 2' : undefined,
              }}
            >
              <p
                className="font-semibold mb-2"
                style={{ color: 'var(--hero-fg)' }}
              >
                {item.question}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--hero-muted)' }}
              >
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CTA BANNER — copied exactly from index.tsx                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function CtaBannerSection({ isAuthenticated }: AuthProps) {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--hero-bg)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="relative rounded-3xl overflow-hidden noise-overlay p-14 border"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.22 0.06 265) 0%, oklch(0.17 0.04 275) 100%)',
            borderColor: 'oklch(0.32 0.06 265)',
          }}
        >
          {/* Radial glow top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 265 / 0.22) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10">
            <Badge variant="dark" className="mb-5">
              Get started today
            </Badge>
            <h2 className="section-headline mb-4" style={{ color: 'var(--hero-fg)' }}>
              Ready to grow your engagement?
            </h2>
            <p
              className="text-base leading-relaxed mb-8 mx-auto"
              style={{ color: 'var(--hero-muted)', maxWidth: '38ch' }}
            >
              Join hundreds of brands using Storywidget to create richer,
              more interactive content experiences.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="brand" size="lg" asChild>
                <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                  {isAuthenticated ? 'Go to dashboard' : 'Start for free'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost-dark"
                size="lg"
                asChild
                className="border"
                style={{ borderColor: 'oklch(0.38 0.05 265)' }}
              >
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FOOTER — copied exactly from index.tsx                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function PublicFooter() {
  return (
    <footer
      className="border-t py-12 px-6"
      style={{ borderColor: 'var(--hero-border)', background: 'oklch(0.09 0.020 265)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand col */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base" style={{ color: 'var(--hero-fg)' }}>
                Storywidget
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.58 0.014 265)' }}>
              Create, publish, and embed interactive story widgets on any website.
              Track engagement in real time.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-10">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'oklch(0.58 0.014 265)' }}
              >
                Product
              </p>
              <ul className="space-y-2">
                {[
                  { to: '/pricing',  label: 'Pricing' },
                  { to: '/register', label: 'Get started' },
                  { to: '/login',    label: 'Sign in' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm transition-colors"
                      style={{ color: 'oklch(0.62 0.014 265)' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--hero-fg)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'oklch(0.62 0.014 265)')
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
                style={{ color: 'oklch(0.58 0.014 265)' }}
              >
                Features
              </p>
              <ul className="space-y-2">
                {['Story Editor', 'Analytics', 'Embed', 'API Access'].map((label) => (
                  <li key={label}>
                    <span className="text-sm" style={{ color: 'oklch(0.62 0.014 265)' }}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t"
          style={{ borderColor: 'oklch(0.16 0.018 265)' }}
        >
          <p className="text-xs" style={{ color: 'oklch(0.52 0.012 265)' }}>
            © {new Date().getFullYear()} Storywidget. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { to: '/pricing',  label: 'Pricing' },
              { to: '/login',    label: 'Sign in' },
              { to: '/register', label: 'Register' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs transition-colors"
                style={{ color: 'oklch(0.56 0.012 265)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--hero-fg)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'oklch(0.56 0.012 265)')
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}