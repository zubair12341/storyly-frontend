import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Plus, Trash2, Tag, Loader2, Pencil, Check, X,
  Code2, Copy, TriangleAlert, Type, ChevronDown, ChevronUp, ExternalLink, LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  categoriesApi,
  apiKeysApi,
  lastApiKeyStorage,
  API_BASE_URL,
  type Category,
  type ApiKey,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  component: CategoriesPage,
});

// ── Widget script URL ──────────────────────────────────────────────
const WIDGET_SCRIPT_URL = `${API_BASE_URL.replace(/\/$/, "")}/widget/v1/widget.js`;

// ── Google Fonts curated list ──────────────────────────────────────
const GOOGLE_FONTS = [
  { name: "Inter",             value: "Inter" },
  { name: "Roboto",            value: "Roboto" },
  { name: "Open Sans",         value: "Open Sans" },
  { name: "Lato",              value: "Lato" },
  { name: "Poppins",           value: "Poppins" },
  { name: "Montserrat",        value: "Montserrat" },
  { name: "Nunito",            value: "Nunito" },
  { name: "Playfair Display",  value: "Playfair Display" },
  { name: "Merriweather",      value: "Merriweather" },
  { name: "Raleway",           value: "Raleway" },
  { name: "Ubuntu",            value: "Ubuntu" },
  { name: "Source Sans 3",     value: "Source Sans 3" },
];

// ── Card shape options ─────────────────────────────────────────────
const CARD_SHAPES = [
  {
    value: "rounded",
    label: "Rounded",
    description: "Rounded rectangle — default style",
    preview: "rounded-2xl w-10 h-14",
  },
  {
    value: "circle",
    label: "Circle",
    description: "Round bubble — like Instagram",
    preview: "rounded-full w-12 h-12",
  },
  {
    value: "square",
    label: "Square",
    description: "Clean square cards",
    preview: "rounded-lg w-12 h-12",
  },
  {
    value: "portrait",
    label: "Portrait",
    description: "Tall portrait — like TikTok",
    preview: "rounded-xl w-9 h-16",
  },
] as const;

type CardShapeValue = typeof CARD_SHAPES[number]["value"];
const loadedFonts = new Set<string>();
function loadGoogleFont(fontFamily: string) {
  if (!fontFamily || fontFamily === "Inter" || loadedFonts.has(fontFamily)) return;
  loadedFonts.add(fontFamily);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600&display=swap`;
  document.head.appendChild(link);
}

// ── Embed snippet generator ────────────────────────────────────────
function buildEmbedSnippet(apiKey: string, categorySlug: string, apiBase: string): string {
  const safeSlug = categorySlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const containerId = `story-widget-${safeSlug}`;
  return `<div id="${containerId}"></div>\n<script\n  src="${WIDGET_SCRIPT_URL}"\n  data-api-key="${apiKey}"\n  data-container="#${containerId}"\n  data-category="${categorySlug}"\n  data-api-url="${apiBase}"\n></script>`.trim();
}

// ── Embed modal ────────────────────────────────────────────────────
function EmbedModal({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const [apiKeys, setApiKeys]           = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys]   = useState(true);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (!category) return;
    setLoadingKeys(true);
    setCopied(false);
    apiKeysApi
      .list()
      .then(setApiKeys)
      .catch(() => setApiKeys([]))
      .finally(() => setLoadingKeys(false));
  }, [category]);

  const firstKey = apiKeys.find((k) => k.is_active) ?? apiKeys[0] ?? null;
  // Full key in memory (just created/rotated this session) takes priority
  const sessionKey = firstKey?.key ?? null;
  // localStorage fallback — only valid if it matches the current key prefix
  // This prevents stale keys from a previous rotation being shown
  const storedKey = (() => {
    const stored = lastApiKeyStorage.get();
    if (!stored || !firstKey) return null;
    // Verify the stored key starts with the current key's prefix
    // key_prefix is the first 12 chars of the raw key
    if (!stored.startsWith(firstKey.key_prefix)) return null;
    return stored;
  })();
  const resolvedKey = sessionKey ?? storedKey ?? null;
  const keySource = sessionKey ? "current" : storedKey ? "stored" : null;
  const hasFullKey = !!resolvedKey;
  const snippet     =
    firstKey && category && resolvedKey
      ? buildEmbedSnippet(resolvedKey, category.slug, API_BASE_URL)
      : null;

  const copySnippet = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!category} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Embed code — {category?.name}
          </DialogTitle>
          <DialogDescription>
            Paste this snippet into any webpage to show stories from this category.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4" style={{ width: "100%", overflowX: "scroll" }}>
          {loadingKeys ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading API keys...
            </div>
          ) : !firstKey ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
              <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  No API key found
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  Please create an API key on the{" "}
                  <a href="/api-keys" className="underline font-medium hover:no-underline">
                    API Keys page
                  </a>{" "}
                  before generating embed code.
                </p>
              </div>
            </div>
          ) : (
            <>
              {!hasFullKey ? (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
                  <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Full API key not available
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                      The full key is only shown once at creation. Create a new API key on the{" "}
                      <a href="/api-keys" className="underline font-medium hover:no-underline">
                        API Keys page
                      </a>
                      , then return here to generate the embed code.
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                      Or paste your key manually into this template:
                    </p>
                    <pre className="mt-2 rounded-md bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
{`<div id="story-widget-${category?.slug}"></div>
<script
  src="${WIDGET_SCRIPT_URL}"
  data-api-key="PASTE_YOUR_FULL_KEY_HERE"
  data-container="#story-widget-${category?.slug}"
  data-category="${category?.slug}"
  data-api-url="${API_BASE_URL}"
></script>`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Snippet
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={copySnippet}>
                      {copied
                        ? <><Check className="h-3 w-3 mr-1.5" />Copied</>
                        : <><Copy className="h-3 w-3 mr-1.5" />Copy</>}
                    </Button>
                  </div>
                  <pre className="rounded-lg border border-border bg-muted p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
{snippet}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>Using key:</span>
                <code className="font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">
                  {firstKey.key_prefix}•••
                </code>
                <Badge variant="outline" className="text-xs">{firstKey.name}</Badge>
                {keySource === "stored" && (
                  <Badge variant="secondary" className="text-xs">last created key</Badge>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Font settings panel ────────────────────────────────────────────
function FontSettingsPanel({
  category,
  onUpdate,
}: {
  category: Category;
  onUpdate: (updated: Category) => void;
}) {
  const [selectedFont, setSelectedFont]     = useState(category.font_family ?? "Inter");
  const [savingFont, setSavingFont]         = useState(false);
  const [uploading, setUploading]           = useState(false);
  const [removingCustom, setRemovingCustom] = useState(false);
  const [selectedShape, setSelectedShape]   = useState<CardShapeValue>(
    (category.card_shape as CardShapeValue) ?? "rounded",
  );
  const [savingShapeId, setSavingShapeId]   = useState<string | null>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  // Load font for preview on mount and on change
  useEffect(() => {
    loadGoogleFont(selectedFont);
  }, [selectedFont]);

  // Also load the category's current font on mount
  useEffect(() => {
    if (category.font_family) loadGoogleFont(category.font_family);
  }, [category.font_family]);

  const handleShapeSelect = async (shapeValue: CardShapeValue) => {
    if (shapeValue === selectedShape || savingShapeId) return;
    setSavingShapeId(shapeValue);
    try {
      const updated = await categoriesApi.updateShape(category.id, shapeValue);
      setSelectedShape(shapeValue);
      onUpdate(updated);
      toast.success("Card shape updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update shape");
    } finally {
      setSavingShapeId(null);
    }
  };

  const handleFontChange = async (fontValue: string) => {
    setSelectedFont(fontValue);
    loadGoogleFont(fontValue);
    setSavingFont(true);
    try {
      const updated = await categoriesApi.updateFont(category.id, {
        font_family: fontValue,
        custom_font_url: undefined, // leave custom_font_url untouched
      });
      onUpdate(updated);
      toast.success("Font updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update font");
    } finally {
      setSavingFont(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { category: updated } = await categoriesApi.uploadFont(category.id, file);
      onUpdate(updated);
      toast.success("Custom font uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveCustomFont = async () => {
    setRemovingCustom(true);
    try {
      const updated = await categoriesApi.updateFont(category.id, {
        font_family: "Inter",
        custom_font_url: null,
      });
      onUpdate(updated);
      setSelectedFont("Inter");
      toast.success("Custom font removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove custom font");
    } finally {
      setRemovingCustom(false);
    }
  };

  const customFontFilename = category.custom_font_url
    ? category.custom_font_url.split("/").pop()?.split("?")[0] ?? "custom font"
    : null;

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 space-y-5">

      {/* Section 0 — Card Shape selector */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5" />
          Widget Card Shape
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CARD_SHAPES.map((shape) => {
            const isSelected = selectedShape === shape.value;
            const isLoading  = savingShapeId === shape.value;

            return (
              <button
                key={shape.value}
                type="button"
                onClick={() => handleShapeSelect(shape.value)}
                disabled={!!savingShapeId}
                className={[
                  "relative flex flex-col items-center gap-2 rounded-lg border p-3 text-left transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  isSelected
                    ? "border-primary ring-2 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-background",
                ].join(" ")}
                aria-pressed={isSelected}
                aria-label={`${shape.label} shape: ${shape.description}`}
              >
                {/* Visual preview */}
                <div className="flex items-center justify-center h-16 w-full">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div
                      className={`${shape.preview} bg-primary/20 flex-shrink-0`}
                    />
                  )}
                </div>

                {/* Label + description */}
                <div className="text-center w-full">
                  <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {shape.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {shape.description}
                  </p>
                </div>

                {/* Selected checkmark */}
                {isSelected && !isLoading && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Section A — Google Font picker */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Google Font
        </p>

        <div className="flex items-center gap-3">
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            disabled={savingFont}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            {GOOGLE_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
          {savingFont && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Font preview */}
        <div
          className="rounded-md border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
          style={{ fontFamily: `'${selectedFont}', sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {/* Section B — Custom font upload */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Or upload a custom font
        </p>

        {category.custom_font_url ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs gap-1">
                <Type className="h-3 w-3" />
                Custom font active
              </Badge>
              <a
                href={category.custom_font_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline underline-offset-2"
              >
                {customFontFilename}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveCustomFont}
              disabled={removingCustom}
              className="text-destructive hover:text-destructive"
            >
              {removingCustom
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Removing…</>
                : <><X className="h-3.5 w-3.5 mr-1.5" />Remove custom font</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor={`font-upload-${category.id}`}
              className="text-xs text-muted-foreground"
            >
              Accepted: .woff, .woff2, .ttf, .otf (max 2 MB)
            </Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                id={`font-upload-${category.id}`}
                type="file"
                accept=".woff,.woff2,.ttf,.otf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-input file:text-sm file:bg-background file:text-foreground file:cursor-pointer hover:file:bg-muted disabled:opacity-50"
              />
              {uploading && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
function CategoriesPage() {
  const [categories, setCategories]       = useState<Category[]>([]);
  const [loading, setLoading]             = useState(true);
  const [newName, setNewName]             = useState("");
  const [creating, setCreating]           = useState(false);
  const [editId, setEditId]               = useState<string | null>(null);
  const [editName, setEditName]           = useState("");
  const [renaming, setRenaming]           = useState(false);
  const editInputRef                      = useRef<HTMLInputElement>(null);
  const [embedCategory, setEmbedCategory] = useState<Category | null>(null);
  const [fontOpenId, setFontOpenId]       = useState<string | null>(null);

  useEffect(() => {
    categoriesApi
      .list()
      .then((cats) => {
        setCategories(cats);
        // Pre-load Google Fonts for all categories
        cats.forEach((c) => {
          if (c.font_family && !c.custom_font_url) {
            loadGoogleFont(c.font_family);
          }
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editId) editInputRef.current?.focus();
  }, [editId]);

  const create = async () => {
    const name = newName.trim();
    if (!name) return toast.error("Name is required");
    setCreating(true);
    try {
      const created = await categoriesApi.create(name);
      setCategories((prev) => [...prev, created]);
      setNewName("");
      toast.success("Category created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") create();
  };

  const startEdit  = (c: Category) => { setEditId(c.id); setEditName(c.name); };
  const cancelEdit = () => { setEditId(null); setEditName(""); };

  const commitRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return toast.error("Name cannot be empty");
    const original = categories.find((c) => c.id === id);
    if (original?.name === name) { cancelEdit(); return; }
    setRenaming(true);
    try {
      const updated = await categoriesApi.update(id, name);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      cancelEdit();
      toast.success("Category renamed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename category");
    } finally {
      setRenaming(false);
    }
  };

  const handleRenameKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter")  commitRename(id);
    if (e.key === "Escape") cancelEdit();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Stories in this category will become uncategorised.`)) return;
    try {
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete category");
    }
  };

  const handleFontUpdate = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const toggleFontPanel = (id: string) => {
    setFontOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Group your stories into categories for easier filtering and widget embedding.
          </p>
        </div>
      </div>

      {/* Create */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">New category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 max-w-md">
            <div className="flex-1 space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleCreateKey}
                placeholder="e.g. Product Updates"
                disabled={creating}
              />
            </div>
            <Button onClick={create} disabled={creating || !newName.trim()}>
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">All categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-medium">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create one above to start organising your stories.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((c) => {
                const isEditing   = editId === c.id;
                const fontOpen    = fontOpenId === c.id;
                const hasCustom   = !!c.custom_font_url;

                return (
                  <li key={c.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                      {/* Left — name / edit */}
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-sm">
                            <Input
                              ref={editInputRef}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => handleRenameKey(e, c.id)}
                              disabled={renaming}
                              className="h-8 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success"
                              disabled={renaming}
                              onClick={() => commitRename(c.id)}
                              aria-label="Confirm rename"
                            >
                              {renaming ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={cancelEdit}
                              aria-label="Cancel rename"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <code className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                {c.slug}
                              </code>
                              <Badge variant="outline" className="text-xs">slug</Badge>
                              {/* Font indicator */}
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Type className="h-3 w-3" />
                                {hasCustom ? "Custom font" : (c.font_family ?? "Inter")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created {new Date(c.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right — actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={fontOpen ? "secondary" : "outline"}
                            onClick={() => toggleFontPanel(c.id)}
                            aria-label="Toggle font settings"
                          >
                            <Type className="h-3.5 w-3.5 mr-1.5" />
                            Display & Font Settings
                            {fontOpen ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEmbedCategory(c)}
                            aria-label="Get embed code"
                          >
                            <Code2 className="h-3.5 w-3.5 mr-1.5" />Embed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(c)}
                            aria-label="Rename category"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(c.id, c.name)}
                            aria-label="Delete category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Font settings panel — only one open at a time */}
                    {fontOpen && !isEditing && (
                      <FontSettingsPanel
                        category={c}
                        onUpdate={handleFontUpdate}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <EmbedModal category={embedCategory} onClose={() => setEmbedCategory(null)} />
    </div>
  );
}