import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, Eye, KeyRound, TrendingUp, Plus,
  MousePointerClick, BarChart3, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  storiesApi, apiKeysApi, analyticsApi, isPublished,
  type Story, type AnalyticsSummary,
} from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  component: Overview,
});

function StatCard({
  icon: Icon, label, value, hint, loading,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 rounded bg-muted animate-pulse" />
        ) : (
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
        )}
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Overview() {
  const [stories, setStories]     = useState<Story[]>([]);
  const [keysCount, setKeysCount] = useState(0);
  const [summary, setSummary]     = useState<AnalyticsSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    storiesApi.list().then(setStories).catch(() => setStories([]));
    apiKeysApi.list().then((k) => setKeysCount(k.length)).catch(() => setKeysCount(0));
    analyticsApi.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const publishedCount = stories.filter((s) => isPublished(s)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back. Here's what's happening with your stories.
          </p>
        </div>
        <Button asChild>
          <Link to="/stories/$storyId" params={{ storyId: "new" }}>
            <Plus className="h-4 w-4 mr-2" />New story
          </Link>
        </Button>
      </div>

      {/* Stat grid — 6 cards: 2 story counts + 4 from real analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={BookOpen}          label="Total stories"  value={stories.length}    hint="All stories" />
        <StatCard icon={TrendingUp}        label="Published"      value={publishedCount}    hint={`${stories.length - publishedCount} drafts`} />
        <StatCard icon={Eye}               label="Story views"    value={summary?.story_views.toLocaleString() ?? "—"} hint="All time"      loading={loadingStats} />
        <StatCard icon={BarChart3}         label="Slide views"    value={summary?.slide_views.toLocaleString() ?? "—"} hint="All time"     loading={loadingStats} />
        <StatCard icon={MousePointerClick} label="CTA clicks"     value={summary?.cta_clicks.toLocaleString() ?? "—"} hint="All time"     loading={loadingStats} />
        <StatCard icon={KeyRound}          label="API keys"       value={keysCount}         hint="Active keys" />
      </div>

      {/* Recent stories */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent stories</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/stories">
              View all <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No stories yet. Create your first one to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {stories.slice(0, 5).map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      to="/stories/$storyId"
                      params={{ storyId: s.id }}
                      className="font-medium hover:underline"
                    >
                      {s.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.slides?.length ?? 0} slides · {isPublished(s) ? "Published" : "Draft"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isPublished(s)
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPublished(s) ? "Live" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}