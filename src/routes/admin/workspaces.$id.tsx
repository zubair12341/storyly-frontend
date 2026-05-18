import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi, type WorkspaceDetail, type SubscriptionDetails } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowLeft, CheckCircle2, AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/workspaces/$id")({
  component: AdminWorkspaceDetailPage,
});

type Plan = "free" | "pro" | "business";

function planBadge(plan: string) {
  switch (plan) {
    case "pro":
      return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30">{plan}</Badge>;
    case "business":
      return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">{plan}</Badge>;
    default:
      return <Badge variant="secondary">{plan}</Badge>;
  }
}

function subStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/15 text-green-600 border-green-500/30">active</Badge>;
    case "trialing":
      return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">trialing</Badge>;
    case "past_due":
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">past due</Badge>;
    case "canceled":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30">canceled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b last:border-0">
      <dt className="w-48 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-all">{value}</dd>
    </div>
  );
}

function AdminWorkspaceDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Workspace state
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Plan override state
  const [selectedPlan, setSelectedPlan] = useState<Plan>("free");
  const [overriding, setOverriding] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Subscription state
  const [sub, setSub] = useState<SubscriptionDetails | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  function fetchWorkspace() {
    setLoading(true);
    setError(null);
    adminApi
      .getWorkspace(id)
      .then((data) => {
        setWorkspace(data);
        setSelectedPlan(data.plan as Plan);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load workspace.");
      })
      .finally(() => setLoading(false));
  }

  function fetchSubscription() {
    setSubLoading(true);
    adminApi
      .getSubscriptionDetails(id)
      .then(setSub)
      .catch((err: unknown) => {
        // Non-fatal — subscription section will show graceful error
        console.error("Failed to load subscription details", err);
        setSub({ has_subscription: false });
      })
      .finally(() => setSubLoading(false));
  }

  useEffect(() => {
    fetchWorkspace();
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleOverride() {
    setOverriding(true);
    setOverrideSuccess(false);
    setOverrideError(null);
    try {
      await adminApi.overridePlan(id, selectedPlan);
      setOverrideSuccess(true);
      fetchWorkspace();
    } catch (err: unknown) {
      setOverrideError(err instanceof Error ? err.message : "Override failed.");
    } finally {
      setOverriding(false);
    }
  }

  async function handleCancelSubscription() {
    setCanceling(true);
    try {
      await adminApi.cancelSubscription(id);
      toast.success("Subscription scheduled to cancel at period end.");
      fetchSubscription();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel subscription.");
    } finally {
      setCanceling(false);
    }
  }

  const canCancel =
    sub?.has_subscription === true &&
    sub.status === "active" &&
    !sub.cancel_at_period_end;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2 text-muted-foreground"
        onClick={() => navigate({ to: "/admin/workspaces" })}
      >
        <ArrowLeft className="h-4 w-4" />
        Workspaces
      </Button>

      {/* Title */}
      {loading ? (
        <Skeleton className="h-8 w-48" />
      ) : (
        <h1 className="text-2xl font-bold tracking-tight">
          {workspace?.name ?? "Workspace"}
        </h1>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full max-w-sm" />
            ))}
          </CardContent>
        </Card>
      ) : workspace ? (
        <>
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DetailRow label="Name" value={workspace.name} />
                <DetailRow label="Owner Email" value={workspace.owner_email || "—"} />
                <DetailRow label="Created At" value={fmt(workspace.created_at)} />
                <DetailRow
                  label="Plan"
                  value={<span className="flex items-center gap-2">{planBadge(workspace.plan)}</span>}
                />
                <DetailRow label="Subscription Status" value={workspace.subscription_status ?? "—"} />
                <DetailRow
                  label="Stripe Customer ID"
                  value={
                    workspace.stripe_customer_id ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {workspace.stripe_customer_id}
                      </code>
                    ) : "—"
                  }
                />
                <DetailRow
                  label="Stripe Subscription ID"
                  value={
                    workspace.stripe_subscription_id ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {workspace.stripe_subscription_id}
                      </code>
                    ) : "—"
                  }
                />
                <DetailRow
                  label="Allowed Domains"
                  value={
                    workspace.allowed_domains?.length
                      ? workspace.allowed_domains.join(", ")
                      : "All domains allowed"
                  }
                />
                <DetailRow label="Stories" value={workspace.story_count} />
                <DetailRow label="API Keys" value={workspace.api_keys_count} />
              </dl>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Subscription Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full max-w-sm" />
                  ))}
                </div>
              ) : !sub || !sub.has_subscription ? (
                <p className="text-sm text-muted-foreground">No active subscription.</p>
              ) : (
                <>
                  {/* Cancel-at-period-end banner */}
                  {sub.cancel_at_period_end && (
                    <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Scheduled to cancel on {fmtDate(sub.current_period_end)}
                    </div>
                  )}

                  <dl>
                    <DetailRow label="Status" value={subStatusBadge(sub.status)} />
                    <DetailRow
                      label="Current Period"
                      value={`${fmtDate(sub.current_period_start)} → ${fmtDate(sub.current_period_end)}`}
                    />
                    <DetailRow
                      label="Amount"
                      value={`${fmtMoney(sub.amount, sub.currency)} / ${sub.interval}`}
                    />
                    <DetailRow
                      label="Payment Method"
                      value={
                        sub.payment_method
                          ? `${sub.payment_method.brand ?? "Card"} ending in ${sub.payment_method.last4} (exp ${sub.payment_method.exp_month}/${sub.payment_method.exp_year})`
                          : "No payment method on file"
                      }
                    />
                    {sub.canceled_at && (
                      <DetailRow label="Canceled At" value={fmt(sub.canceled_at)} />
                    )}
                  </dl>

                  {/* Cancel subscription button */}
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={canceling}>
                          {canceling ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Canceling…</>
                          ) : (
                            "Cancel Subscription"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cancel subscription for this workspace? They will keep access
                            until{" "}
                            <strong>{fmtDate(sub.current_period_end)}</strong>.
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleCancelSubscription}
                          >
                            Yes, cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Override Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Override Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manually set this workspace's plan without going through Stripe.
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as Plan)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="free">free</option>
                  <option value="pro">pro</option>
                  <option value="business">business</option>
                </select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={overriding}>
                      {overriding ? "Applying…" : "Apply Override"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm plan override</AlertDialogTitle>
                      <AlertDialogDescription>
                        Change this workspace to the <strong>{selectedPlan}</strong> plan?
                        This bypasses Stripe and takes effect immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleOverride}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {overrideSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Plan updated successfully.
                </div>
              )}
              {overrideError && (
                <p className="text-sm text-destructive">{overrideError}</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}