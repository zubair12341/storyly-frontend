import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Lock, Globe, Loader2, Check, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { apiFetch, workspacesApi, type WorkspaceSettings } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  // ── Password change state ─────────────────────────────────────
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

  // ── Domain whitelist state ────────────────────────────────────
  const [settings, setSettings]       = useState<WorkspaceSettings | null>(null);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [domains, setDomains]         = useState<string[]>([]);
  const [newDomain, setNewDomain]     = useState("");
  const [savingDomains, setSavingDomains] = useState(false);

  useEffect(() => {
    workspacesApi.getSettings()
      .then((s) => {
        setSettings(s);
        setDomains(s.allowed_domains);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load domain settings."))
      .finally(() => setDomainsLoading(false));
  }, []);

  const maxDomains  = settings?.max_allowed_domains ?? 0;
  const atLimit     = domains.length >= maxDomains;
  const plan        = settings?.plan ?? "free";

  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    if (!trimmed) return;
    if (domains.includes(trimmed)) {
      toast.error("That domain is already in the list.");
      return;
    }
    if (atLimit) return; // guard — button should already be disabled
    setDomains((prev) => [...prev, trimmed]);
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    setDomains((prev) => prev.filter((d) => d !== domain));
  };

  const handleSaveDomains = async () => {
    setSavingDomains(true);
    try {
      const updated = await workspacesApi.updateAllowedDomains(domains);
      setSettings((prev) => prev ? { ...prev, allowed_domains: updated.allowed_domains } : prev);
      setDomains(updated.allowed_domains);
      toast.success("Allowed domains saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save domains.");
    } finally {
      setSavingDomains(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and workspace preferences.
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

        <Separator />

        {/* Allowed domains */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Allowed domains</CardTitle>
              </div>
              {!domainsLoading && settings && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {domains.length} of {maxDomains} domain{maxDomains === 1 ? "" : "s"} used
                </span>
              )}
            </div>
            <CardDescription>
              Restrict your widget to load only on these domains. Leave empty to allow all domains.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {domainsLoading ? (
              <div className="space-y-2">
                <div className="h-8 rounded bg-muted animate-pulse" />
                <div className="h-8 rounded bg-muted animate-pulse w-3/4" />
              </div>
            ) : (
              <>
                {/* Domain list */}
                {domains.length > 0 ? (
                  <ul className="space-y-2">
                    {domains.map((domain) => (
                      <li
                        key={domain}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-muted/30 text-sm"
                      >
                        <span className="font-mono text-xs">{domain}</span>
                        <button
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
                          aria-label={`Remove ${domain}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No domains added — widget loads on all domains.
                  </p>
                )}

                {/* At-limit warning */}
                {atLimit && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                    You have reached the domain limit for your{" "}
                    <Badge variant="secondary" className="text-xs mx-0.5">{plan}</Badge>{" "}
                    plan.{" "}
                    <Link to="/billing" className="underline underline-offset-2 font-medium">
                      Upgrade to add more.
                    </Link>
                  </div>
                )}

                {/* Add domain input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !atLimit && handleAddDomain()}
                    disabled={atLimit}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddDomain}
                    disabled={atLimit || !newDomain.trim()}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Save button */}
                <Button
                  onClick={handleSaveDomains}
                  disabled={savingDomains}
                  className="w-full sm:w-auto"
                >
                  {savingDomains ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                  ) : (
                    "Save domains"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}