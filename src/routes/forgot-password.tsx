import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Loader2, MailCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email."); return; }
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
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

        {sent ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <MailCheck className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link to="/login" className="block text-sm text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Forgot password?</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send a reset link.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              Remembered it?{" "}
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