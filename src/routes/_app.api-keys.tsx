import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, KeyRound, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { apiKeysApi, type ApiKey } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/api-keys")({
  component: ApiKeysPage,
});

// FIX: show key_prefix (always available) or the full key (only on create)
function maskKey(k: ApiKey): string {
  // If the full raw key is present (just created), show it masked
  if (k.key) {
    return k.key.length <= 12 ? k.key : `${k.key.slice(0, 6)}${"•".repeat(20)}${k.key.slice(-4)}`;
  }
  // Otherwise show the stored prefix + mask
  return `${k.key_prefix}${"•".repeat(20)}`;
}

function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiKeysApi.list()
      .then(setKeys)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return toast.error("Name is required");
    setCreating(true);
    try {
      const k = await apiKeysApi.create(newKeyName.trim());
      setKeys((prev) => [k, ...prev]);
      setRevealedId(k.id);
      setNewKeyName("");
      setDialogOpen(false);
      toast.success("API key created — copy it now, it won't be shown again");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const copy = async (k: ApiKey) => {
    // FIX: was k.key — use full key if present (just created), else key_prefix
    const toCopy = k.key ?? k.key_prefix;
    await navigator.clipboard.writeText(toCopy);
    setCopiedId(k.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const remove = async (id: string) => {
    if (!confirm("Revoke this API key? Apps using it will stop working.")) return;
    try {
      await apiKeysApi.delete(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("API key revoked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage keys used to access the Story Widget API.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Give this key a name so you can recognize it later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Production website" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={createKey} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Your keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12">
              <KeyRound className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-medium">No API keys yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create one to start integrating.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {keys.map((k) => {
                const revealed = revealedId === k.id;
                return (
                  <li key={k.id} className="py-4 flex flex-wrap items-center gap-4 justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{k.name}</p>
                        {/* FIX: was no active indicator — backend returns is_active */}
                        {!k.is_active && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground truncate max-w-md">
                          {/* FIX: was k.key (undefined after list) — use maskKey helper */}
                          {revealed ? (k.key ?? k.key_prefix) : maskKey(k)}
                        </code>
                        {/* Only allow reveal if we have the full key (just created) */}
                        {k.key && (
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => setRevealedId(revealed ? null : k.id)}
                          >
                            {revealed ? "Hide" : "Reveal"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {/* FIX: was k.createdAt (undefined) → k.created_at (snake_case) */}
                        Created {new Date(k.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => copy(k)}>
                        {copiedId === k.id ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                        {copiedId === k.id ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(k.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}