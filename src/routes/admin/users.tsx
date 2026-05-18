import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi, type UserRow } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function roleBadge(role: string) {
  if (role === "admin") {
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20">
        admin
      </Badge>
    );
  }
  return <Badge variant="secondary">user</Badge>;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PAGE_SIZE = 20;

function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function fetchUsers() {
    setLoading(true);
    setError(null);
    adminApi
      .getUsers(page, PAGE_SIZE)
      .then((res) => {
        setUsers(res.data);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load users.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getUsers(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data);
          setTotal(res.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load users.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  async function handleToggleRole(user: UserRow) {
    const newRole = user.role === "admin" ? "user" : "admin";
    setTogglingId(user.id);
    try {
      await adminApi.setUserRole(user.id, newRole);
      fetchUsers();
    } catch {
      // silently fall through — could add toast here
    } finally {
      setTogglingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages;

  // We match by email since the JWT sub (userId) isn't directly exposed on
  // the auth context user object — matching email is safe enough here.
  function isSelf(row: UserRow) {
    return row.email === currentUser?.email;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total > 0 ? `${total.toLocaleString()} users total` : "All users on the platform."}
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmt(u.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {isSelf(u) ? (
                      <span className="text-xs text-muted-foreground px-3 py-1">You</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleRole(u)}
                      >
                        {togglingId === u.id
                          ? "Saving…"
                          : u.role === "admin"
                          ? "Remove Admin"
                          : "Make Admin"}
                      </Button>
                    )}
                  </TableCell>
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
