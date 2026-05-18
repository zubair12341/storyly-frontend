import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch, tokenStorage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [workspace, setWorkspace] = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    if (!email.includes("@"))           { toast.error("Enter a valid email.");            return false; }
    if (password.length < 6)            { toast.error("Password must be at least 6 characters."); return false; }
    if (password !== confirm)           { toast.error("Passwords do not match.");          return false; }
    if (!workspace.trim())              { toast.error("Workspace name is required.");      return false; }
    return true;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ access_token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, workspaceName: workspace.trim() }),
      });
      tokenStorage.set(res.access_token);
      toast.success("Account created — welcome!");
      // Hard navigate so AuthProvider re-reads token from storage
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel — identical to login */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Storywidget</span>
        </div>
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl font-semibold leading-tight">
            Start publishing stories in minutes.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create your free account, embed your first widget, and watch engagement grow.
          </p>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Storywidget Inc.</p>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Storywidget</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace name</Label>
              <Input
                id="workspace"
                type="text"
                placeholder="Acme Inc."
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}