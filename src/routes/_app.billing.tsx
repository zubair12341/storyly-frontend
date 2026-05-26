import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  XCircle,
  Calendar,
  Globe,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  billingApi,
  storiesApi,
  analyticsApi,
  plansApi,
  workspacesApi,
  type BillingStatus,
  type PublicPlanConfig,
  type WorkspaceSettings,
} from "@/lib/api";

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

// ─── Constants ───────────────────────────────────────────────────────────────

const UNLIMITED = 2147483647;

function formatLimit(value: number | null | undefined): string {
  if (value == null || value >= UNLIMITED) return "Unlimited";
  return value.toLocaleString();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethod = { brand: string; last4: string; exp_month: number; exp_year: number };

interface PageState {
  billing: BillingStatus | null;
  paymentMethod: PaymentMethod | null;
  storyCount: number;
  monthlyViews: number;
  loading: boolean;
  actionLoading: string | null;
  error: string | null;
}

// ─── Fallback plans ───────────────────────────────────────────────────────────

const FALLBACK_AVAILABLE_PLANS: PublicPlanConfig[] = [
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
    features: ["50 stories", "50,000 monthly views", "Advanced analytics", "Priority support"],
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
    features: ["Unlimited stories", "Unlimited views", "Advanced analytics", "SLA support"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string | null) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100">Active</Badge>;
    case "trialing":
      return <Badge className="bg-blue-100 text-blue-700 border-0 hover:bg-blue-100">Trial</Badge>;
    case "past_due":
      return <Badge variant="destructive">Past Due</Badge>;
    case "canceled":
      return <Badge variant="secondary">Canceled</Badge>;
    default:
      return <Badge variant="secondary">{status ?? "Free"}</Badge>;
  }
}

function UsageRow({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number | null | undefined;
}) {
  const isUnlimited = max == null || max >= UNLIMITED;
  const ratio = isUnlimited ? 0 : current / max;
  const pct = Math.min(ratio * 100, 100);
  const progressClass =
    !isUnlimited && current >= max
      ? "bg-red-500"
      : !isUnlimited && ratio > 0.8
      ? "bg-amber-500"
      : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {(current ?? 0).toLocaleString()} / {formatLimit(max)}
        </span>
      </div>
      <Progress
        value={isUnlimited ? 0 : pct}
        className="h-2"
        // @ts-expect-error -- indicatorClassName is a custom prop on our Progress component
        indicatorClassName={progressClass}
      />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

function BillingPage() {
  const navigate = useNavigate();

  const [state, setState] = useState<PageState>({
    billing: null,
    paymentMethod: null,
    storyCount: 0,
    monthlyViews: 0,
    loading: true,
    actionLoading: null,
    error: null,
  });

  // Available plans from API
  const [availablePlans, setAvailablePlans] = useState<PublicPlanConfig[]>([]);

  // Domain management state
  const [wsSettings, setWsSettings]         = useState<WorkspaceSettings | null>(null);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [domains, setDomains]               = useState<string[]>([]);
  const [newDomain, setNewDomain]           = useState("");
  const [savingDomains, setSavingDomains]   = useState(false);

  function setActionLoading(v: string | null) {
    setState((s) => ({ ...s, actionLoading: v }));
  }

  async function refreshBilling() {
    const updated = await billingApi.status();
    setState((s) => ({ ...s, billing: updated }));
  }

  useEffect(() => {
    // Load available plans
    plansApi
      .list()
      .then((data) =>
        setAvailablePlans(
          data.filter((p) => p.plan_id !== "free").sort((a, b) => a.sort_order - b.sort_order),
        ),
      )
      .catch(() => setAvailablePlans(FALLBACK_AVAILABLE_PLANS));

    // Load domain settings
    workspacesApi
      .getSettings()
      .then((s) => {
        setWsSettings(s);
        setDomains(s.allowed_domains);
      })
      .catch(() => toast.error("Failed to load domain settings."))
      .finally(() => setDomainsLoading(false));

    // Load billing data
    (async () => {
      try {
        const [billing, paymentMethod, stories] = await Promise.all([
          billingApi.status(),
          billingApi.getPaymentMethod().catch(() => null),
          storiesApi.list().catch(() => [] as Awaited<ReturnType<typeof storiesApi.list>>),
        ]);

        let monthlyViews = 0;
        try {
          const analytics = await analyticsApi.summary();
          monthlyViews = analytics?.story_views ?? 0;
        } catch {
          // silently fallback
        }

        setState({
          billing,
          paymentMethod,
          storyCount: stories.length,
          monthlyViews,
          loading: false,
          actionLoading: null,
          error: null,
        });
      } catch {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Failed to load billing information. Please refresh.",
        }));
      }
    })();
  }, []);

  // ── Billing action handlers ───────────────────────────────────────────────

  async function handleCancel() {
    setActionLoading("cancel");
    try {
      await billingApi.cancel();
      toast.success("Subscription will cancel at end of billing period.");
      await refreshBilling();
    } catch {
      toast.error("Failed to cancel. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate() {
    setActionLoading("reactivate");
    try {
      await billingApi.reactivate();
      toast.success("Subscription reactivated!");
      await refreshBilling();
    } catch {
      toast.error("Failed to reactivate. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleChangePlan(planId: string) {
    setActionLoading("changePlan");
    try {
      const updated = await billingApi.changePlan(planId as "pro" | "business");
      setState((s) => ({ ...s, billing: updated }));
      const label = availablePlans.find((p) => p.plan_id === planId)?.display_name ?? planId;
      toast.success(`Plan updated to ${label}!`);
    } catch {
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCheckout(planId: string) {
    try {
      const result = await billingApi.createCheckoutSession(planId as "pro" | "business");
      window.location.href = result.url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  }

  // ── Domain handlers ───────────────────────────────────────────────────────

  const maxDomains = wsSettings?.max_allowed_domains ?? 0;
  const atLimit    = domains.length >= maxDomains;

  function handleAddDomain() {
    const trimmed = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    if (!trimmed) return;
    if (domains.includes(trimmed)) {
      toast.error("That domain is already in the list.");
      return;
    }
    if (atLimit) return;
    setDomains((prev) => [...prev, trimmed]);
    setNewDomain("");
  }

  function handleRemoveDomain(domain: string) {
    if (domains.length === 1) {
      toast.error("You must have at least one domain. Add a new domain before removing this one.");
      return;
    }
    setDomains((prev) => prev.filter((d) => d !== domain));
  }

  async function handleSaveDomains() {
    if (domains.length === 0) {
      toast.error("At least one domain is required for the widget to work.");
      return;
    }
    setSavingDomains(true);
    try {
      const updated = await workspacesApi.updateAllowedDomains(domains);
      setWsSettings((prev) => (prev ? { ...prev, allowed_domains: updated.allowed_domains } : prev));
      setDomains(updated.allowed_domains);
      toast.success("Allowed domains saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save domains.");
    } finally {
      setSavingDomains(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const { billing, paymentMethod, storyCount, monthlyViews, loading, actionLoading, error } = state;
  const currentPlan = billing?.plan ?? "free";

  function planRank(planId: string): number {
    const idx = availablePlans.findIndex((p) => p.plan_id === planId);
    return idx === -1 ? -1 : idx;
  }
  const currentRank = planRank(currentPlan);

  const currentPlanLabel = (() => {
    const match = availablePlans.find((p) => p.plan_id === currentPlan);
    if (match) return match.display_name;
    return currentPlan === "free" ? "Free" : currentPlan;
  })();

  const currentPlanPrice = (() => {
    const match = availablePlans.find((p) => p.plan_id === currentPlan);
    if (match) return match.price_monthly === 0 ? "Free" : `$${match.price_monthly / 100}/month`;
    return currentPlan === "free" ? "Free" : null;
  })();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
          <p className="text-muted-foreground">Manage your plan, usage, and payment method.</p>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-muted-foreground">
          Manage your plan, allowed domains, usage, and payment method.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {billing && (
        <>
          {/* ── Section 1: Current Plan ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Current Plan</CardTitle>
                {statusBadge(billing.subscription_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-3xl font-bold">{currentPlanLabel}</p>
                {currentPlanPrice && (
                  <p className="text-muted-foreground text-sm mt-0.5">{currentPlanPrice}</p>
                )}
              </div>

              {billing.cancel_at_period_end ? (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Your subscription cancels on {formatDate(billing.current_period_end)}
                  </AlertDescription>
                </Alert>
              ) : billing.subscription_status === "active" && billing.current_period_end ? (
                <p className="text-sm text-muted-foreground">
                  <Calendar size={14} className="inline mr-1 mb-0.5" />
                  Renews {formatDate(billing.current_period_end)}
                </p>
              ) : null}

              {billing.subscription_status === "past_due" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Payment failed. Please update your payment method.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              {billing.cancel_at_period_end ? (
                <Button onClick={handleReactivate} disabled={actionLoading === "reactivate"}>
                  {actionLoading === "reactivate" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Reactivate Subscription
                </Button>
              ) : billing.plan !== "free" && billing.subscription_status === "active" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your plan will remain active until{" "}
                        {formatDate(billing.current_period_end)}. After that, your workspace will
                        revert to the Free plan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleCancel}
                        disabled={actionLoading === "cancel"}
                      >
                        {actionLoading === "cancel" ? "Canceling..." : "Yes, cancel"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </CardFooter>
          </Card>

          {/* ── Section 2: Available Plans (dynamic) ────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Upgrade or change your plan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {availablePlans.map((plan) => {
                  const planKey    = plan.plan_id;
                  const targetRank = planRank(planKey);
                  const isCurrent  = planKey === currentPlan;
                  const isUpgrade  = targetRank > currentRank;
                  const isDowngrade = !isCurrent && targetRank < currentRank;
                  const isLoading  = actionLoading === "changePlan";
                  const priceLabel =
                    plan.price_monthly === 0 ? "Free" : `$${plan.price_monthly / 100}/mo`;

                  return (
                    <div
                      key={planKey}
                      className="flex items-center justify-between px-6 py-4 gap-4"
                    >
                      <div>
                        <p className="font-semibold">{plan.display_name}</p>
                        <p className="text-sm text-muted-foreground">{priceLabel}</p>
                        {plan.features.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {plan.features.slice(0, 3).map((f) => (
                              <li
                                key={f}
                                className="text-xs text-muted-foreground flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex gap-2 items-center shrink-0">
                        {isCurrent ? (
                          <Badge variant="secondary">Current plan</Badge>
                        ) : isUpgrade ? (
                          currentPlan === "free" ? (
                            <Button
                              size="sm"
                              disabled={isLoading}
                              onClick={() => handleCheckout(planKey)}
                            >
                              {isLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              Upgrade
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={isLoading}>
                                  {isLoading ? (
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  ) : (
                                    <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
                                  )}
                                  Upgrade
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Upgrade to {plan.display_name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Your card will be charged or credited the prorated difference
                                    immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleChangePlan(planKey)}>
                                    Confirm upgrade
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )
                        ) : isDowngrade ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isLoading}>
                                {isLoading ? (
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                  <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Downgrade
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Downgrade to {plan.display_name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Your card will be charged or credited the prorated difference
                                  immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleChangePlan(planKey)}>
                                  Confirm downgrade
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Section 3: Current Usage ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>
                {billing.current_period_end
                  ? `Billing period ending ${formatDate(billing.current_period_end)}`
                  : "Current billing period"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <UsageRow label="Stories"       current={storyCount}    max={billing.limits.maxStories} />
              <Separator />
              <UsageRow label="Monthly Views" current={monthlyViews}  max={billing.limits.maxMonthlyViews} />
              <Separator />
              <UsageRow
                label="Allowed Domains"
                current={domains.length}
                max={wsSettings?.max_allowed_domains ?? billing.limits.maxAllowedDomains}
              />
            </CardContent>
          </Card>

          {/* ── Section 4: Allowed Domains ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle>Allowed Domains</CardTitle>
                    <CardDescription className="mt-0.5">
                      Your widget will only load on these domains. At least one is required.
                    </CardDescription>
                  </div>
                </div>
                {!domainsLoading && wsSettings && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {domains.length} / {maxDomains} used
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {domainsLoading ? (
                <div className="space-y-2">
                  <div className="h-8 rounded bg-muted animate-pulse" />
                  <div className="h-8 rounded bg-muted animate-pulse w-3/4" />
                </div>
              ) : (
                <>
                  {/* No-domains warning */}
                  {domains.length === 0 && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        No domains configured — your widget is currently blocked on all websites.
                        Add at least one domain below.
                      </span>
                    </div>
                  )}

                  {/* Domain list */}
                  {domains.length > 0 && (
                    <ul className="space-y-2">
                      {domains.map((domain) => (
                        <li
                          key={domain}
                          className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-muted/30 text-sm"
                        >
                          <span className="font-mono text-xs">{domain}</span>
                          <button
                            onClick={() => handleRemoveDomain(domain)}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
                            aria-label={`Remove ${domain}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* At-limit warning with upgrade link */}
                  {atLimit && domains.length > 0 && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                      You've reached the domain limit for your{" "}
                      <Badge variant="secondary" className="text-xs mx-0.5">
                        {currentPlanLabel}
                      </Badge>{" "}
                      plan. Upgrade above to add more domains.
                    </div>
                  )}

                  {/* Add domain input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. example.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !atLimit && handleAddDomain()}
                      disabled={atLimit}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddDomain}
                      disabled={atLimit || !newDomain.trim()}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Save button */}
                  <Button
                    onClick={handleSaveDomains}
                    disabled={savingDomains || domains.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {savingDomains ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                    ) : (
                      "Save domains"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Section 5: Payment Method ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethod ? (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No payment method on file.</p>
              )}

              {billing.plan !== "free" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate({ to: "/billing-payment-method" })}
                >
                  <CreditCard className="h-3.5 w-3.5 mr-2" />
                  Update payment method
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}