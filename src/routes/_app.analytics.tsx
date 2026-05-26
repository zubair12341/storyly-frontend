import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Eye, MousePointerClick, TrendingUp, BarChart3,
  BookOpen, Loader2, RefreshCw, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  analyticsApi, storiesApi,
  type AnalyticsSummary, type StoryAnalytics, type Story, type AnalyticsTimeline,
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

const DAY_OPTIONS = [7, 30, 90] as const;
type DayOption = typeof DAY_OPTIONS[number];

function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rows, setRows] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Timeline state
  const [selectedDays, setSelectedDays] = useState<DayOption>(7);
  const [timeline, setTimeline] = useState<AnalyticsTimeline | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(true);

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

  // Fetch timeline on mount and whenever selectedDays changes
  useEffect(() => {
    setTimelineLoading(true);
    analyticsApi.timeline(selectedDays)
      .then(setTimeline)
      .catch(() => setTimeline(null))
      .finally(() => setTimelineLoading(false));
  }, [selectedDays]);

  // Convert timeline data into recharts format
  const chartData = timeline
    ? timeline.labels.map((date, i) => ({
        date,
        story_views: timeline.datasets.story_views[i] ?? 0,
        cta_clicks:  timeline.datasets.cta_clicks[i]  ?? 0,
      }))
    : [];

  const hasChartData = chartData.some((d) => d.story_views > 0 || d.cta_clicks > 0);

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

      {/* ── Time-series chart ── */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2 flex-wrap gap-3">
          <CardTitle className="text-base">Views over time</CardTitle>
          <div className="flex items-center gap-1">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={selectedDays === d ? "default" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setSelectedDays(d)}
              >
                {d} days
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : !hasChartData ? (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  formatter={(value) =>
                    value === "story_views" ? "Story Views" : "CTA Clicks"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="story_views"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="cta_clicks"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Summary stat cards ── */}
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
          <StatCard icon={Eye}               label="Story Views"  value={summary.story_views.toLocaleString()} hint="Total story opens" />
          <StatCard icon={BarChart3}         label="Slide Views"  value={summary.slide_views.toLocaleString()} hint="Across all stories" />
          <StatCard icon={MousePointerClick} label="CTA Clicks"   value={summary.cta_clicks.toLocaleString()} hint="Total CTA interactions" accent />
          <StatCard icon={TrendingUp}        label="CTR"          value={pct(summary.ctr)} hint="CTA clicks ÷ story views" accent />
        </div>
      ) : null}

      {/* ── Per-story table ── */}
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