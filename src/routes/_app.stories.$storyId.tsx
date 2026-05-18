import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save,
  Loader2, ImageIcon, Upload, VideoIcon, LinkIcon, UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { storiesApi, categoriesApi, apiFetch, isPublished, type Slide, type Story, type Category } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/stories/$storyId")({
  component: StoryEditor,
});

function emptySlide(): Slide {
  return { type: "image", url: "", duration: 5000 };
}

// ── Media upload helpers ───────────────────────────────────────────

async function getPresignedUrl(fileName: string, fileType: string) {
  return apiFetch<{ uploadUrl: string; publicUrl: string; path: string }>(
    "/media/presigned-url",
    { method: "POST", body: JSON.stringify({ fileName, fileType }) },
  );
}

async function uploadToStorage(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

function detectSlideType(mimeType: string): "image" | "video" {
  return mimeType.startsWith("video/") ? "video" : "image";
}

// ── Generic single-image upload field ─────────────────────────────

function ImageUploadField({
  label,
  hint,
  value,
  accept = "image/*",
  required = false,
  disabled = false,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type);
      await uploadToStorage(uploadUrl, file);
      onChange(publicUrl);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}

      <div className="flex items-center gap-3">
        {/* Square preview */}
        <div className="h-14 w-14 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {value
            ? <img src={value} alt="" className="h-full w-full object-cover" />
            : <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />}
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading
              ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Uploading…</>
              : <><Upload className="h-3.5 w-3.5 mr-2" />Upload</>}
          </Button>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL…"
            className="h-7 text-xs"
            disabled={disabled || uploading}
          />
        </div>
      </div>
    </div>
  );
}

// ── Slide thumbnail in sidebar ─────────────────────────────────────

function SlideThumbnail({ slide }: { slide: Slide }) {
  if (!slide.url) return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  if (slide.type === "video") {
    return (
      <div className="relative h-full w-full">
        <video src={slide.url} className="h-full w-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <VideoIcon className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }
  return <img src={slide.url} alt="" className="h-full w-full object-cover" />;
}

// ── Slide media upload button ──────────────────────────────────────

function MediaUpload({
  onUploaded,
  disabled,
}: {
  onUploaded: (url: string, type: "image" | "video") => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type);
      await uploadToStorage(uploadUrl, file);
      onUploaded(publicUrl, detectSlideType(file.type));
      toast.success("Media uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-full"
        disabled={disabled || uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading
          ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Uploading…</>
          : <><Upload className="h-3.5 w-3.5 mr-2" />Upload image / video</>}
      </Button>
    </>
  );
}

// ── Preview pane ───────────────────────────────────────────────────

function SlidePreview({ slide, slides, activeIdx }: { slide: Slide; slides: Slide[]; activeIdx: number }) {
  return (
    <div className="mx-auto rounded-2xl overflow-hidden bg-muted relative" style={{ aspectRatio: "9/16", maxWidth: 280 }}>
      {slide?.url ? (
        slide.type === "video" ? (
          <video key={slide.url} src={slide.url} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={slide.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 opacity-40" />
        </div>
      )}
      {slide?.cta?.label && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white text-black text-center py-3 rounded-full text-sm font-medium shadow-elevated">
            {slide.cta.label}
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 right-2 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className={`h-0.5 flex-1 rounded-full ${i === activeIdx ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

// ── Main editor ────────────────────────────────────────────────────

function StoryEditor() {
  const { storyId } = useParams({ from: "/_app/stories/$storyId" });
  const isNew = storyId === "new";
  const navigate = useNavigate();

  const [title, setTitle]               = useState("");
  const [published, setPublished]       = useState(false);
  const [categoryId, setCategoryId]     = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");   // required
  const [logoUrl, setLogoUrl]           = useState("");     // optional
  const [categories, setCategories]     = useState<Category[]>([]);
  const [slides, setSlides]             = useState<Slide[]>([emptySlide()]);
  const [activeIdx, setActiveIdx]       = useState(0);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    const fetchCategories = categoriesApi.list().catch(() => [] as Category[]);
    if (isNew) {
      fetchCategories.then(setCategories).finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    Promise.all([storiesApi.get(storyId), fetchCategories])
      .then(([s, cats]: [Story, Category[]]) => {
        setTitle(s.title);
        setPublished(isPublished(s));
        setSlides(s.slides?.length ? s.slides : [emptySlide()]);
        setCategoryId(s.category_id ?? null);
        // Hydrate new fields from existing story
        setCoverImageUrl((s as any).cover_image_url ?? s.thumbnail_url ?? "");
        setLogoUrl((s as any).logo_url ?? "");
        setCategories(cats);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [storyId, isNew]);

  const updateSlide = (idx: number, patch: Partial<Slide>) =>
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const addSlide = () => {
    setSlides((prev) => [...prev, emptySlide()]);
    setActiveIdx(slides.length);
  };

  const removeSlide = (idx: number) => {
    if (slides.length === 1) return toast.error("At least one slide is required");
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, idx - 1));
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!coverImageUrl.trim()) return toast.error("Cover image is required");
    if (slides.some((s) => !s.url?.trim())) return toast.error("Every slide needs a media URL");

    setSaving(true);
    try {
      const payload = {
        title:           title.trim(),
        slides,
        category_id:     categoryId ?? null,
        cover_image_url: coverImageUrl.trim(),
        logo_url:        logoUrl.trim() || null,
        // Keep thumbnail_url in sync for backward compatibility
        thumbnail_url:   coverImageUrl.trim(),
      };

      let result: Story = isNew
        ? await storiesApi.create(payload)
        : await storiesApi.update(storyId, payload);

      if (published && !isPublished(result)) result = await storiesApi.publish(result.id);
      else if (!published && isPublished(result)) result = await storiesApi.unpublish(result.id);

      toast.success(isNew ? "Story created" : "Story saved");
      if (isNew) navigate({ to: "/stories/$storyId", params: { storyId: result.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>;

  const active = slides[activeIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/stories"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "New story" : "Edit story"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Build your slides and publish when ready.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card">
            <Label htmlFor="pub" className="text-sm">Published</Label>
            <Switch id="pub" checked={published} onCheckedChange={setPublished} />
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {/* Metadata — title + category */}
      <Card className="shadow-soft">
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Story title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My awesome story" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId ?? "none"} onValueChange={(v) => setCategoryId(v === "none" ? null : v)}>
              <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">No categories yet — create them from the Categories page.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branding — cover image + logo */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-sm">Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          {/* Cover image — required */}
          <ImageUploadField
            label="Cover image"
            hint="Shown in the story tray bubble. Required."
            value={coverImageUrl}
            required
            disabled={saving}
            onChange={setCoverImageUrl}
          />

          {/* Logo — optional */}
          <ImageUploadField
            label="Logo"
            hint="Optional. Shown in the viewer header alongside the story title."
            value={logoUrl}
            disabled={saving}
            onChange={setLogoUrl}
          />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[280px_1fr_360px] gap-6">
        {/* Slide list */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Slides ({slides.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={addSlide}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-2 p-2 rounded-md border text-left transition-colors ${
                  i === activeIdx ? "border-primary bg-accent" : "border-border hover:bg-muted"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="h-12 w-9 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  <SlideThumbnail slide={s} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Slide {i + 1}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {s.type} · {((s.duration ?? 5000) / 1000).toFixed(0)}s
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
          <CardContent>
            <SlidePreview slide={active} slides={slides} activeIdx={activeIdx} />
          </CardContent>
        </Card>

        {/* Slide editor */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Slide {activeIdx + 1}</CardTitle>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeSlide(activeIdx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Slide media upload */}
            <div className="space-y-2">
              <Label>Media</Label>
              <MediaUpload
                disabled={saving}
                onUploaded={(url, type) => updateSlide(activeIdx, { url, type })}
              />
              {active.url && (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
                  {active.type === "video"
                    ? <VideoIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    : <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                  <span className="truncate">{active.url.split("/").pop()}</span>
                </div>
              )}
            </div>

            {/* Manual URL fallback */}
            <div className="space-y-2">
              <Label htmlFor="img" className="flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3" />
                Or paste URL
              </Label>
              <Input
                id="img"
                value={active.url ?? ""}
                onChange={(e) => updateSlide(activeIdx, {
                  url: e.target.value,
                  type: /\.(mp4|webm|mov|ogg)(\?|$)/i.test(e.target.value) ? "video" : "image",
                })}
                placeholder="https://..."
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="dur">Duration (seconds)</Label>
              <Input
                id="dur"
                type="number"
                min={1}
                max={60}
                value={((active.duration ?? 5000) / 1000).toFixed(0)}
                onChange={(e) => updateSlide(activeIdx, { duration: Math.max(500, Number(e.target.value) * 1000) })}
              />
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <Label htmlFor="cta">CTA text</Label>
              <Input
                id="cta"
                value={active.cta?.label ?? ""}
                onChange={(e) => updateSlide(activeIdx, {
                  cta: e.target.value
                    ? { label: e.target.value, url: active.cta?.url ?? "" }
                    : undefined,
                })}
                placeholder="Shop now"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaUrl">CTA URL</Label>
              <Input
                id="ctaUrl"
                value={active.cta?.url ?? ""}
                onChange={(e) => updateSlide(activeIdx, {
                  cta: { label: active.cta?.label ?? "", url: e.target.value },
                })}
                placeholder="https://..."
              />
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}