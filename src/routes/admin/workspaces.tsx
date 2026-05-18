import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi, type WorkspaceRow } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/workspaces")({
  component: AdminWorkspacesPage,
});

function planBadge(plan: string) {
  switch (plan) {
    case "pro":
      return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 hover:bg-purple-500/20">{plan}</Badge>;
    case "business":
      return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/20">{plan}</Badge>;
    default:
      return <Badge variant="secondary">{plan}</Badge>;
  }
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PAGE_SIZE = 20;

function AdminWorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getWorkspaces(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setWorkspaces(res.data);
          setTotal(res.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load workspaces.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total > 0 ? `${total.toLocaleString()} workspaces total` : "All workspaces on the platform."}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stories</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : workspaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No workspaces found.
                </TableCell>
              </TableRow>
            ) : (
              workspaces.map((ws) => (
                <TableRow
                  key={ws.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({ to: "/admin/workspaces/$id", params: { id: ws.id } })
                  }
                >
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ws.owner_email || "—"}</TableCell>
                  <TableCell>{planBadge(ws.plan)}</TableCell>
                  <TableCell>
                    {ws.subscription_status ? (
                      <span className="text-sm">{ws.subscription_status}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{ws.story_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmt(ws.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
