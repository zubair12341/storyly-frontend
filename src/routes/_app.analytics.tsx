import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Eye, MousePointerClick, TrendingUp, BarChart3,
  BookOpen, Loader2, RefreshCw, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  analyticsApi, storiesApi,
  type AnalyticsSummary, type StoryAnalytics, type Story,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${accent ? "bg-primary/10" : "bg-accent"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

interface StoryRow extends Story {
  stats: StoryAnalytics | null;
  loadingStats: boolean;
}

function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rows, setRows] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sum, stories] = await Promise.all([
        analyticsApi.summary(),
        storiesApi.list(),
      ]);
      setSummary(sum);

      // Initialise rows immediately so the table is visible while stats load
      const initial: StoryRow[] = stories.map((s) => ({
        ...s,
        stats: null,
        loadingStats: true,
      }));
      setRows(initial);

      // Fetch per-story stats concurrently
      stories.forEach(async (s, i) => {
        try {
          const stats = await analyticsApi.storyStats(s.id);
          setRows((prev) =>
            prev.map((r, idx) => (idx === i ? { ...r, stats, loadingStats: false } : r)),
          );
        } catch {
          setRows((prev) =>
            prev.map((r, idx) => (idx === i ? { ...r, loadingStats: false } : r)),
          );
        }
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track views, engagement and CTA performance across your stories.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary stat cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-soft animate-pulse">
              <CardHeader className="pb-2"><div className="h-4 w-24 rounded bg-muted" /></CardHeader>
              <CardContent><div className="h-8 w-16 rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye}              label="Story Views"  value={summary.story_views.toLocaleString()} hint="Total story opens" />
          <StatCard icon={BarChart3}        label="Slide Views"  value={summary.slide_views.toLocaleString()} hint="Across all stories" />
          <StatCard icon={MousePointerClick} label="CTA Clicks"  value={summary.cta_clicks.toLocaleString()} hint="Total CTA interactions" accent />
          <StatCard icon={TrendingUp}       label="CTR"          value={pct(summary.ctr)} hint="CTA clicks ÷ story views" accent />
        </div>
      ) : null}

      {/* Per-story table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Per-story breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 && !loading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No stories yet. Create and publish one to see analytics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Story</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Views</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Slides</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">CTA Clicks</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Completion</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate">{row.title}</td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className={row.status === "published"
                            ? "bg-success/10 text-success border-0"
                            : "bg-muted text-muted-foreground border-0"}
                        >
                          {row.status === "published" ? "Live" : "Draft"}
                        </Badge>
                      </td>
                      {row.loadingStats ? (
                        <td colSpan={4} className="px-4 py-4 text-right">
                          <Loader2 className="h-3.5 w-3.5 animate-spin inline-block text-muted-foreground" />
                        </td>
                      ) : row.stats ? (
                        <>
                          <td className="px-4 py-4 text-right tabular-nums">{row.stats.story_views.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{row.stats.slide_views.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{row.stats.cta_clicks.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-medium ${row.stats.completion_rate > 0.5 ? "text-success" : ""}`}>
                              {pct(row.stats.completion_rate)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-4 py-4 text-right text-muted-foreground text-xs">
                          No data
                        </td>
                      )}
                      <td className="px-4 py-4 text-right">
                        <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                          <Link to="/stories/$storyId" params={{ storyId: row.id }}>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}