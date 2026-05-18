import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Code2, KeyRound, ExternalLink, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiKeysApi, API_BASE_URL, type ApiKey } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/integration")({
  component: IntegrationPage,
});

// Widget script is served from the backend — not a local file
const WIDGET_SCRIPT_URL = `${API_BASE_URL.replace(/\/$/, "")}/widget/v1/widget.js`;

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border border-border bg-sidebar overflow-hidden">
      {label && (
        <div className="px-4 py-2 border-b border-sidebar-border flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-sidebar-foreground/50" />
          <span className="text-xs text-sidebar-foreground/60 font-mono">{label}</span>
        </div>
      )}
      <pre className="p-4 text-xs font-mono text-sidebar-foreground overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {code}
      </pre>
      <Button
        size="sm"
        variant="secondary"
        onClick={copy}
        className="absolute top-2 right-2 h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

function IntegrationPage() {
  const [keys, setKeys]       = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    apiKeysApi.list()
      .then((k) => {
        setKeys(k);
        if (k.length > 0) setSelected(k[0].key_prefix);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeKey = keys.find((k) => k.key_prefix === selected);
  const displayKey = activeKey?.key_prefix
    ? `${activeKey.key_prefix}${"•".repeat(16)}`
    : "YOUR_API_KEY";

  const embedSnippet = `<!-- Storywidget embed -->
<script
  src="${WIDGET_SCRIPT_URL}"
  data-api-key="${displayKey}"
  data-api-url="${API_BASE_URL}"
  data-container="#story-widget"
  defer
></script>

<div id="story-widget"></div>`;

  const npmSnippet = `npm install @storywidget/sdk
# or
yarn add @storywidget/sdk`;

  const jsSnippet = `import StoryWidget from '@storywidget/sdk';

StoryWidget.init({
  apiKey: '${displayKey}',
  apiUrl: '${API_BASE_URL}',
  container: '#story-widget',
});`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Embed your story widget on any website with a single script tag.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: API key picker */}
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">API key</CardTitle>
              </div>
              <CardDescription>
                Select the key to use in your snippet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="h-8 rounded bg-muted animate-pulse" />
              ) : keys.length === 0 ? (
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>No API keys yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/api-keys">
                      <KeyRound className="h-3.5 w-3.5 mr-2" />
                      Create API key
                    </Link>
                  </Button>
                </div>
              ) : (
                keys.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelected(k.key_prefix)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                      selected === k.key_prefix
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium block">{k.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {k.key_prefix}••••
                    </span>
                  </button>
                ))
              )}
              {keys.length > 0 && (
                <Button variant="ghost" size="sm" asChild className="w-full mt-1">
                  <Link to="/api-keys">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Manage keys
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Place the script before <code className="text-xs bg-muted px-1 py-0.5 rounded">{"</body>"}</code> for best performance.</p>
              <p>• Use the <code className="text-xs bg-muted px-1 py-0.5 rounded">defer</code> attribute to avoid blocking page load.</p>
              <p>• Each API key can be scoped to a specific domain in a future release.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: code snippets */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Script embed</CardTitle>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <CardDescription>
                Paste this snippet into any HTML page to embed your widget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={embedSnippet} label="HTML" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <Code2 className="h-4 w-4 text-muted-foreground inline mr-2" />
              <CardTitle className="text-base inline">JavaScript / npm</CardTitle>
              <CardDescription className="mt-1">
                For React, Vue, or other JS frameworks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CodeBlock code={npmSnippet} label="Terminal" />
              <CodeBlock code={jsSnippet}  label="JavaScript" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}