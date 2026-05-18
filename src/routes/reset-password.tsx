import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate  = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6)  { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { toast.error("Passwords do not match."); return; }
    if (!token)                { toast.error("Reset token is missing."); return; }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      setDone(true);
      toast.success("Password updated!");
      setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <Link to="/login" className="flex items-center gap-2 justify-center">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Storywidget</span>
        </Link>

        {done ? (
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold">Password updated</h2>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
              <p className="text-sm text-muted-foreground">
                Choose a strong password for your account.
              </p>
            </div>

            {!token && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Missing reset token. Please use the link from your email.
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!token}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={!token}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !token}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}