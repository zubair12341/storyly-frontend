import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Zap, CheckCircle2, Loader2, CreditCard, AlertCircle, Sparkles, CalendarClock, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billingApi, type BillingStatus } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

const PRO_FEATURES = [
  "Unlimited stories",
  "Unlimited monthly views",
  "Priority support",
  "Advanced analytics",
  "Custom branding",
];

const FREE_FEATURES = [
  "Up to 5 stories",
  "1,000 monthly views",
  "Community support",
  "Basic analytics",
];

function statusLabel(status: string | null): { text: string; className: string } {
  switch (status) {
    case "active":    return { text: "Active",    className: "bg-success/10 text-success border-0" };
    case "trialing":  return { text: "Trial",     className: "bg-warning/10 text-warning border-0" };
    case "past_due":  return { text: "Past due",  className: "bg-destructive/10 text-destructive border-0" };
    case "canceled":  return { text: "Canceled",  className: "bg-muted text-muted-foreground border-0" };
    default:          return { text: "Free plan", className: "bg-muted text-muted-foreground border-0" };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    billingApi.status()
      .then(setBilling)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { url } = await billingApi.createCheckoutSession("pro");
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const { url } = await billingApi.createPortalSession();
      window.location.href = url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not open billing portal."
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const isPaid = billing?.plan === "pro" || billing?.plan === "business";
  const isPro  = billing?.plan === "pro";
  const { text: statusText, className: statusClassName } = statusLabel(
    isPro ? (billing?.subscription_status ?? "active") : null,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your plan and subscription.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current plan card */}
          <Card className="shadow-soft lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Current plan</CardTitle>
                <Badge variant="secondary" className={statusClassName}>
                  {statusText}
                </Badge>
              </div>
              <CardDescription>
                {isPro ? "You're on the Pro plan." : "You're on the Free plan."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">{isPro ? "$29" : "$0"}</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>

              {/* Renewal / cancellation date — paid plans only */}
              {isPaid && billing?.current_period_end && (
                <div className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 ${
                  billing.cancel_at_period_end
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {billing.cancel_at_period_end ? (
                    <>
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Cancels on {formatDate(billing.current_period_end)}
                    </>
                  ) : (
                    <>
                      <CalendarClock className="h-4 w-4 shrink-0" />
                      Renews on {formatDate(billing.current_period_end)}
                    </>
                  )}
                </div>
              )}

              <ul className="space-y-2">
                {(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isPro && (
                <Button
                  className="w-full mt-2"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirecting…</>
                  ) : (
                    <><Zap className="h-4 w-4 mr-2" />Upgrade to Pro</>
                  )}
                </Button>
              )}

              {isPaid && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirecting…</>
                  ) : (
                    <><CreditCard className="h-4 w-4 mr-2" />Manage billing</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Plan comparison */}
          <Card className="shadow-soft lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Plan comparison</CardTitle>
              <CardDescription>See what's included in each plan.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground w-1/2">Feature</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Free</th>
                      <th className="text-center px-4 py-3 font-medium text-primary">
                        <div className="flex items-center justify-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> Pro
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Stories",          "5",       "Unlimited"],
                      ["Monthly views",    "1,000",   "Unlimited"],
                      ["Analytics",        "Basic",   "Advanced"],
                      ["API access",       "✓",       "✓"],
                      ["Custom branding",  "—",       "✓"],
                      ["Priority support", "—",       "✓"],
                    ].map(([feature, free, pro]) => (
                      <tr key={feature} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-6 py-3 text-muted-foreground">{feature}</td>
                        <td className="px-4 py-3 text-center">{free}</td>
                        <td className="px-4 py-3 text-center font-medium text-primary">{pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Usage card */}
          {billing && (
            <Card className="shadow-soft lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Plan limits</CardTitle>
                <CardDescription>Hard limits enforced on the {billing.plan} plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Max stories</p>
                      <p className="font-semibold">
                        {billing.limits.maxStories === 1e308 ? "Unlimited" : billing.limits.maxStories}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly views</p>
                      <p className="font-semibold">
                        {billing.limits.maxMonthlyViews === 1e308 ? "Unlimited" : billing.limits.maxMonthlyViews.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}