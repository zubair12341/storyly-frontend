import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Info,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, PlanConfig, CreatePlanPayload } from "@/lib/api";

export const Route = createFileRoute("/admin/plans")({
  component: AdminPlansPage,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function centsToDollars(cents: number): string {
  return String(Math.round(cents / 100));
}

function dollarsToCents(dollars: string): number {
  return Math.round((parseFloat(dollars) || 0) * 100);
}

const UNLIMITED = 2147483647;

function displayLimit(value: number): string {
  return value >= UNLIMITED ? "Unlimited" : String(value);
}

function parseLimit(value: string): number {
  if (value.toLowerCase() === "unlimited") return UNLIMITED;
  return parseInt(value, 10) || 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditablePlan {
  display_name: string;
  price_dollars: string;
  stripe_price_id: string;
  max_stories: string;
  max_monthly_views: string;
  max_allowed_domains: string;
  features: string;
  is_active: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isTogglingActive: boolean;
  stripeIdWarningVisible: boolean;
}

function planToEditable(plan: PlanConfig): EditablePlan {
  return {
    display_name: plan.display_name,
    price_dollars: centsToDollars(plan.price_monthly),
    stripe_price_id: plan.stripe_price_id ?? "",
    max_stories: displayLimit(plan.max_stories),
    max_monthly_views: displayLimit(plan.max_monthly_views),
    max_allowed_domains: String(plan.max_allowed_domains),
    features: plan.features.join("\n"),
    is_active: plan.is_active,
    isDirty: false,
    isSaving: false,
    isTogglingActive: false,
    stripeIdWarningVisible: false,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [editState, setEditState] = useState<Record<string, EditablePlan>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create-plan form state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    plan_id: "",
    display_name: "",
    price_dollars: "0",
    max_stories: "50",
    max_monthly_views: "50000",
    max_allowed_domains: "3",
    sort_order: "3",
    features: "",
    is_active: true,
  });

  useEffect(() => {
    adminApi
      .getPlans()
      .then((data) => {
        setPlans(data);
        const state: Record<string, EditablePlan> = {};
        for (const plan of data) {
          state[plan.plan_id] = planToEditable(plan);
        }
        setEditState(state);
      })
      .catch(() => setError("Failed to load plans. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof EditablePlan>(
    planId: string,
    key: K,
    value: EditablePlan[K],
  ) {
    setEditState((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [key]: value, isDirty: true },
    }));
  }

  // ── Create plan ──────────────────────────────────────────

  async function handleCreate() {
    if (!newPlan.plan_id.trim() || !newPlan.display_name.trim()) {
      toast.error("Plan ID and Display Name are required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(newPlan.plan_id)) {
      toast.error("Plan ID must be lowercase letters, numbers, and hyphens only.");
      return;
    }

    setCreating(true);
    try {
      const payload: CreatePlanPayload = {
        plan_id:             newPlan.plan_id.trim(),
        display_name:        newPlan.display_name.trim(),
        price_monthly:       dollarsToCents(newPlan.price_dollars),
        max_stories:         parseLimit(newPlan.max_stories),
        max_monthly_views:   parseLimit(newPlan.max_monthly_views),
        max_allowed_domains: parseInt(newPlan.max_allowed_domains, 10) || 1,
        sort_order:          parseInt(newPlan.sort_order, 10) || 0,
        features:            newPlan.features.split("\n").map((f) => f.trim()).filter(Boolean),
        is_active:           newPlan.is_active,
      };

      const created = await adminApi.createPlan(payload);
      setPlans((prev) => [...prev, created]);
      setEditState((prev) => ({ ...prev, [created.plan_id]: planToEditable(created) }));
      setShowCreate(false);
      setNewPlan({
        plan_id: "",
        display_name: "",
        price_dollars: "0",
        max_stories: "50",
        max_monthly_views: "50000",
        max_allowed_domains: "3",
        sort_order: "3",
        features: "",
        is_active: true,
      });
      const priceNote =
        payload.price_monthly > 0
          ? " Stripe product and recurring price were created automatically."
          : "";
      toast.success(`Plan "${created.display_name}" created.${priceNote}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create plan.");
    } finally {
      setCreating(false);
    }
  }

  // ── Save / toggle existing plans ─────────────────────────

  async function handleSave(planId: string) {
    const state = editState[planId];
    if (!state) return;

    setEditState((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], isSaving: true },
    }));

    const payload = {
      display_name:        state.display_name,
      price_monthly:       dollarsToCents(state.price_dollars),
      stripe_price_id:     state.stripe_price_id || null,
      max_stories:         parseLimit(state.max_stories),
      max_monthly_views:   parseLimit(state.max_monthly_views),
      max_allowed_domains: parseInt(state.max_allowed_domains, 10),
      features:            state.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    try {
      const updated = await adminApi.updatePlan(planId, payload);
      setPlans((prev) =>
        prev.map((p) => (p.plan_id === planId ? updated : p)),
      );
      setEditState((prev) => ({
        ...prev,
        [planId]: { ...planToEditable(updated), isDirty: false, isSaving: false },
      }));
      toast.success(`${state.display_name} plan updated`);
    } catch {
      setEditState((prev) => ({
        ...prev,
        [planId]: { ...prev[planId], isSaving: false },
      }));
      toast.error("Failed to save plan changes");
    }
  }

  async function handleToggle(planId: string) {
    setEditState((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], isTogglingActive: true },
    }));

    try {
      const result = await adminApi.togglePlan(planId);
      setPlans((prev) =>
        prev.map((p) => (p.plan_id === planId ? result : p)),
      );
      setEditState((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          is_active: result.is_active,
          isTogglingActive: false,
        },
      }));
      toast.success(`Plan ${result.is_active ? "activated" : "deactivated"}`);
    } catch {
      setEditState((prev) => ({
        ...prev,
        [planId]: { ...prev[planId], isTogglingActive: false },
      }));
      toast.error("Failed to toggle plan status");
    }
  }

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Plan Management</h1>
        <p className="text-muted-foreground mt-1">
          Edit plan limits, pricing, and features. Changes take effect
          immediately for all workspaces.
        </p>
      </div>

      {/* Warning alert */}
      <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          Changes to plan limits take effect immediately for all workspaces on
          that plan.
        </AlertDescription>
      </Alert>

      {/* Add new plan toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "+ Add new plan"}
        </Button>
      </div>

      {/* Create plan form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create new plan</CardTitle>
            <CardDescription>
              The plan ID cannot be changed after creation. For paid plans,
              a Stripe product and monthly recurring price are created
              automatically — no manual Stripe setup needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* plan_id */}
              <div className="space-y-1.5">
                <Label>
                  Plan ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. enterprise"
                  value={newPlan.plan_id}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, plan_id: e.target.value.toLowerCase() }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, hyphens only. Cannot be changed later.
                </p>
              </div>

              {/* display_name */}
              <div className="space-y-1.5">
                <Label>
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Enterprise"
                  value={newPlan.display_name}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, display_name: e.target.value }))
                  }
                />
              </div>

              {/* price */}
              <div className="space-y-1.5">
                <Label>Price ($/month)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newPlan.price_dollars}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, price_dollars: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Stripe product + price created automatically for paid plans
                </p>
              </div>

              {/* max_stories */}
              <div className="space-y-1.5">
                <Label>Max Stories</Label>
                <Input
                  value={newPlan.max_stories}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, max_stories: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter "Unlimited" for no limit
                </p>
              </div>

              {/* max_monthly_views */}
              <div className="space-y-1.5">
                <Label>Max Monthly Views</Label>
                <Input
                  value={newPlan.max_monthly_views}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, max_monthly_views: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter "Unlimited" for no limit
                </p>
              </div>

              {/* max_allowed_domains */}
              <div className="space-y-1.5">
                <Label>Max Domains</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPlan.max_allowed_domains}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, max_allowed_domains: e.target.value }))
                  }
                />
              </div>

              {/* sort_order */}
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  min="0"
                  value={newPlan.sort_order}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, sort_order: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Lower = shown first. Free=0, Pro=1, Business=2
                </p>
              </div>

              {/* features — full width */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label>Features (one per line)</Label>
                <Textarea
                  rows={4}
                  placeholder={"Unlimited stories\nAdvanced analytics\nPriority support"}
                  value={newPlan.features}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, features: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  "Create plan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const state = editState[plan.plan_id];
          if (!state) return null;
          const isFree = plan.plan_id === "free";

          return (
            <Card key={plan.plan_id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <Badge
                    variant={state.is_active ? "default" : "secondary"}
                    className={
                      state.is_active
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }
                  >
                    {state.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">
                  {plan.plan_id}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <Label htmlFor={`name-${plan.plan_id}`}>Display Name</Label>
                  <Input
                    id={`name-${plan.plan_id}`}
                    value={state.display_name}
                    onChange={(e) =>
                      updateField(plan.plan_id, "display_name", e.target.value)
                    }
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <Label htmlFor={`price-${plan.plan_id}`}>
                    Price ($/month)
                  </Label>
                  <Input
                    id={`price-${plan.plan_id}`}
                    type="number"
                    min="0"
                    value={state.price_dollars}
                    disabled={isFree}
                    onChange={(e) =>
                      updateField(plan.plan_id, "price_dollars", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 0 for free plans
                  </p>
                </div>

                {/* Stripe Price ID — hidden for free plan */}
                {!isFree && (
                  <div className="space-y-1.5">
                    <Label htmlFor={`stripe-${plan.plan_id}`}>
                      Stripe Price ID
                    </Label>
                    <Input
                      id={`stripe-${plan.plan_id}`}
                      value={state.stripe_price_id}
                      placeholder="price_1ABC..."
                      onChange={(e) => {
                        setEditState((prev) => ({
                          ...prev,
                          [plan.plan_id]: {
                            ...prev[plan.plan_id],
                            stripe_price_id: e.target.value,
                            isDirty: true,
                            stripeIdWarningVisible: true,
                          },
                        }));
                      }}
                    />
                    {state.stripeIdWarningVisible && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Info size={12} />
                        Changing this affects new checkout sessions. Existing
                        subscriptions are unaffected.
                      </div>
                    )}
                  </div>
                )}

                {/* Max Stories */}
                <div className="space-y-1.5">
                  <Label htmlFor={`stories-${plan.plan_id}`}>Max Stories</Label>
                  <Input
                    id={`stories-${plan.plan_id}`}
                    value={state.max_stories}
                    onChange={(e) =>
                      updateField(plan.plan_id, "max_stories", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter &quot;Unlimited&quot; for no limit
                  </p>
                </div>

                {/* Max Monthly Views */}
                <div className="space-y-1.5">
                  <Label htmlFor={`views-${plan.plan_id}`}>
                    Max Monthly Views
                  </Label>
                  <Input
                    id={`views-${plan.plan_id}`}
                    value={state.max_monthly_views}
                    onChange={(e) =>
                      updateField(
                        plan.plan_id,
                        "max_monthly_views",
                        e.target.value,
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter &quot;Unlimited&quot; for no limit
                  </p>
                </div>

                {/* Max Domains */}
                <div className="space-y-1.5">
                  <Label htmlFor={`domains-${plan.plan_id}`}>
                    Max Domains
                  </Label>
                  <Input
                    id={`domains-${plan.plan_id}`}
                    type="number"
                    min="1"
                    value={state.max_allowed_domains}
                    onChange={(e) =>
                      updateField(
                        plan.plan_id,
                        "max_allowed_domains",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  <Label htmlFor={`features-${plan.plan_id}`}>
                    Features (one per line)
                  </Label>
                  <Textarea
                    id={`features-${plan.plan_id}`}
                    rows={6}
                    value={state.features}
                    onChange={(e) =>
                      updateField(plan.plan_id, "features", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    These bullet points appear on the pricing page
                  </p>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-2 pt-2 mt-auto">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    disabled={!state.isDirty || state.isSaving}
                    onClick={() => handleSave(plan.plan_id)}
                  >
                    {state.isSaving ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Save changes
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      state.is_active
                        ? "text-red-600 border-red-200 hover:bg-red-50"
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }
                    disabled={state.isTogglingActive}
                    onClick={() => handleToggle(plan.plan_id)}
                  >
                    {state.is_active ? (
                      <ToggleLeft className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <ToggleRight className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {state.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}