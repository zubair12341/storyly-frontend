import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi, type AdminStats, type RevenueOverview } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  BookOpen,
  Activity,
  LayoutGrid,
  DollarSign,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/admin/stats")({
  component: AdminStatsPage,
});

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
      </CardContent>
    </Card>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function chargeStatusBadge(status: string) {
  if (status === "succeeded") {
    return <Badge className="bg-green-500/15 text-green-600 border-green-500/30">succeeded</Badge>;
  }
  return <Badge className="bg-destructive/15 text-destructive border-destructive/30">{status}</Badge>;
}

function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Fetch stats
    setStatsLoading(true);
    adminApi
      .getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err: unknown) => {
        if (!cancelled)
          setStatsError(err instanceof Error ? err.message : "Failed to load stats.");
      })
      .finally(() => { if (!cancelled) setStatsLoading(false); });

    // Fetch revenue — independent, non-blocking
    setRevenueLoading(true);
    adminApi
      .getRevenue()
      .then((data) => { if (!cancelled) setRevenue(data); })
      .catch((err: unknown) => {
        if (!cancelled)
          setRevenueError(err instanceof Error ? err.message : "Revenue data unavailable.");
      })
      .finally(() => { if (!cancelled) setRevenueLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of the platform.
        </p>
      </div>

      {statsError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {statsError}
        </div>
      )}

      {/* Primary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard title="Total Workspaces" value={stats.total_workspaces}        icon={Building2} />
            <StatCard title="Total Users"       value={stats.total_users}             icon={Users} />
            <StatCard title="Total Stories"     value={stats.total_stories}           icon={BookOpen} />
            <StatCard title="Events This Month" value={stats.total_events_this_month} icon={Activity} />
          </>
        ) : null}
      </div>

      {/* Plan breakdown */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          Plan Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : stats ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Free</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.plans.free.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">workspaces</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.plans.pro.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">workspaces</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.plans.business.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">workspaces</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>

      {/* Revenue section */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Revenue
        </h2>

        {revenueError ? (
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Revenue data unavailable.
          </div>
        ) : (
          <>
            {/* MRR + active subs cards */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {revenueLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : revenue ? (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        MRR
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${revenue.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">per month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Subscriptions
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {revenue.active_subscriptions.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">paying customers</p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* Recent charges table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Charges</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {revenueLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                    ))}
                  </div>
                ) : !revenue || revenue.recent_charges.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6">No recent charges.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenue.recent_charges.map((charge) => (
                          <TableRow key={charge.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {fmtDate(charge.created)}
                            </TableCell>
                            <TableCell className="font-medium tabular-nums whitespace-nowrap">
                              {fmtMoney(charge.amount, charge.currency)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {charge.customer_email ?? charge.description ?? "—"}
                            </TableCell>
                            <TableCell>
                              {chargeStatusBadge(charge.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}