import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Copy, KeyRound, Check, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiKeysApi, type ApiKey } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/api-keys")({
  component: ApiKeysPage,
});

function maskKey(k: ApiKey): string {
  if (k.key) {
    return k.key.length <= 12
      ? k.key
      : `${k.key.slice(0, 6)}${"•".repeat(20)}${k.key.slice(-4)}`;
  }
  return `${k.key_prefix}${"•".repeat(20)}`;
}

function ApiKeysPage() {
  const [key, setKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  useEffect(() => {
    apiKeysApi
      .list()
      .then((keys) => setKey(keys[0] ?? null))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRotate() {
    if (!newKeyName.trim()) return toast.error("Name is required");
    setRotating(true);
    try {
      const k = await apiKeysApi.rotate(newKeyName.trim());
      setKey(k);
      setRevealedId(k.id);
      setNewKeyName("");
      setDialogOpen(false);
      toast.success("API key rotated — copy it now, it will not be shown again");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rotate key");
    } finally {
      setRotating(false);
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim()) return toast.error("Name is required");
    setRotating(true);
    try {
      const k = await apiKeysApi.create(newKeyName.trim());
      setKey(k);
      setRevealedId(k.id);
      setNewKeyName("");
      setDialogOpen(false);
      toast.success("API key created — copy it now, it will not be shown again");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setRotating(false);
    }
  }

  const copy = async (k: ApiKey) => {
    const toCopy = k.key ?? k.key_prefix;
    await navigator.clipboard.writeText(toCopy);
    setCopiedId(k.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const revealed = key !== null && revealedId === key.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Key</h1>
          <p className="text-muted-foreground text-sm mt-1">
            One active key per workspace. Rotate it to invalidate the old key.
          </p>
        </div>

        <Button
          variant={key ? "outline" : "default"}
          onClick={() => {
            if (key) setNewKeyName(key.name);
            setDialogOpen(true);
          }}
        >
          {key ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotate key
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create key
            </>
          )}
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{key ? "Rotate API key" : "Create API key"}</DialogTitle>
            <DialogDescription>
              {key
                ? "This will immediately invalidate your current key. Any embed using the old key will stop working until updated."
                : "Give your key a name so you can recognize it later."}
            </DialogDescription>
          </DialogHeader>

          {key && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <AlertDescription className="text-sm">
                ⚠️ Your existing API key will be permanently invalidated. Update
                your embed snippets after rotation.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 py-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Production website"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {key ? (
              <Button
                variant="destructive"
                onClick={handleRotate}
                disabled={rotating}
              >
                {rotating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Rotate key
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={rotating}>
                {rotating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main card */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Your API Key</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !key ? (
            <div className="text-center py-12">
              <KeyRound className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-medium">No API key yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first key to start embedding stories on your website.
              </p>
              <Button
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create key
              </Button>
            </div>
          ) : (
            <>
              <div className="py-2 flex flex-wrap items-center gap-4 justify-between">
                <div className="min-w-0 flex-1">
                  {/* Name + badge */}
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{key.name}</p>
                    <Badge
                      variant={key.is_active ? "default" : "destructive"}
                      className={
                        key.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : undefined
                      }
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Key display */}
                  <div className="flex items-center gap-2 mt-2">
                    <code className="font-mono text-xs px-2 py-1 rounded bg-muted text-muted-foreground truncate max-w-md">
                      {revealed ? (key.key ?? key.key_prefix) : maskKey(key)}
                    </code>
                    {key.key && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline shrink-0"
                        onClick={() =>
                          setRevealedId(revealed ? null : key.id)
                        }
                      >
                        {revealed ? "Hide" : "Reveal"}
                      </button>
                    )}
                  </div>

                  {/* Created date */}
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(key)}>
                    {copiedId === key.id ? (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {copiedId === key.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewKeyName(key.name);
                      setDialogOpen(true);
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Rotate
                  </Button>
                </div>
              </div>

              {/* Info callout */}
              <div className="mt-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                💡 Copy your key and add it as the{" "}
                <code className="font-mono text-xs bg-muted px-1 rounded">
                  data-api-key
                </code>{" "}
                attribute in your embed snippet. This key is only shown in full
                once — after leaving this page only the prefix will be visible.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}