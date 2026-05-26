import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Lock, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  // ── Password change state ─────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw]   = useState(false);
  const [pwSaved, setPwSaved]     = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return toast.error("All password fields are required.");
    if (newPw.length < 8)     return toast.error("New password must be at least 8 characters.");
    if (newPw !== confirmPw)  return toast.error("Passwords do not match.");

    setSavingPw(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSaved(true);
      toast.success("Password updated.");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update password.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and login credentials.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account info */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Account</CardTitle>
            </div>
            <CardDescription>Your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Your email is used to sign in and cannot be changed here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Change password */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Change password</CardTitle>
            </div>
            <CardDescription>Update your login password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                placeholder="••••••••"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                placeholder="Min. 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm new password</Label>
              <Input
                id="confirm-pw"
                type="password"
                placeholder="Repeat new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={savingPw || pwSaved}
              className="w-full sm:w-auto"
            >
              {savingPw ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : pwSaved ? (
                <><Check className="h-4 w-4 mr-2" />Saved</>
              ) : (
                "Update password"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}