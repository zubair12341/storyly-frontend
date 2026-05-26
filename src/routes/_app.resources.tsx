import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Tag,
  BarChart3,
  Code2,
  KeyRound,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/_app/resources")({
  component: ResourcesPage,
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TOC                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
const TOC_LINKS = [
  { href: "#stories",    label: "Stories"           },
  { href: "#categories", label: "Categories"        },
  { href: "#analytics",  label: "Analytics"         },
  { href: "#embed",      label: "Embed & Integration" },
  { href: "#api-keys",   label: "API Keys"           },
  { href: "#billing",    label: "Billing"            },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Section wrapper                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Documentation and guides for every feature in Storywidget.
        </p>
      </div>

      <div className="flex gap-10 items-start">
        {/* ── Sidebar TOC ─────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-6 self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            On this page
          </p>
          <nav className="space-y-0.5">
            {TOC_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block text-sm py-1.5 px-3 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* ── Section 1: Stories ──────────────────────────────────────── */}
          <Section id="stories" icon={BookOpen} title="Stories">
            <h3 className="text-base font-semibold mt-6 mb-2">What are stories?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stories are the core content unit in Storywidget. Each story is a collection of
              slides that plays as a full-screen overlay when a viewer taps a card in the widget
              tray on your website.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">How to create a story</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Go to Stories in the sidebar and click "New story"</li>
              <li>Give your story a title</li>
              <li>
                Add slides using the slide editor — upload images or videos, set a duration, and
                optionally add a CTA button
              </li>
              <li>Assign the story to a category (optional)</li>
              <li>Click Publish when ready — the story goes live instantly</li>
            </ol>

            <h3 className="text-base font-semibold mt-6 mb-2">Story statuses</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two statuses — Draft and Published. Draft stories are visible only in the dashboard
              and not served by the widget. Published stories are live and visible to visitors on
              your website.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Slides</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Each story can have multiple slides. Each slide supports:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Image (JPG, PNG, WebP)</li>
              <li>Video (MP4, WebM)</li>
              <li>Custom HTML content</li>
              <li>Duration (how long the slide shows before auto-advancing)</li>
              <li>CTA button (label + URL)</li>
            </ul>

            <h3 className="text-base font-semibold mt-6 mb-2">CTA Buttons</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Call-to-Action button appears at the bottom of a slide. When clicked it opens the
              target URL in a new tab and records a CTA click event in Analytics. Add a CTA by
              setting a label (e.g. "Shop now") and a URL on any slide in the editor.
            </p>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground mt-6">
              💡 Your plan determines how many stories you can create. Free: 5 stories. Pro: 50
              stories. Business: Unlimited. Upgrade in Billing if you need more.
            </div>
          </Section>

          <Separator className="mt-16" />

          {/* ── Section 2: Categories ───────────────────────────────────── */}
          <Section id="categories" icon={Tag} title="Categories">
            <h3 className="text-base font-semibold mt-6 mb-2">What are categories?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Categories group stories together for display on your website. Each category has its
              own embed code, so you can show different story collections in different parts of
              your site.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">How to create a category</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Go to Categories in the sidebar</li>
              <li>Click "New category" and give it a name</li>
              <li>Assign stories to the category from the Stories page</li>
              <li>Copy the embed code from the category row and paste it on your site</li>
            </ol>

            <h3 className="text-base font-semibold mt-6 mb-2">Custom fonts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each category can use a custom font for story card labels. Choose from Google Fonts
              or upload your own font file (TTF/OTF/WOFF2). The font is injected into the widget
              automatically.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Card shapes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Four card shapes are available per category:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Rounded (portrait, 9:16)</li>
              <li>Portrait (portrait, 9:16 tighter)</li>
              <li>Square (1:1)</li>
              <li>Circle (1:1 circular crop)</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Change the shape in the category settings — it applies to all stories in that
              category.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Per-category embed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each category has a unique <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-category</code> attribute in its embed code. This lets you embed
              different story collections on the same site.
            </p>
          </Section>

          <Separator className="mt-16" />

          {/* ── Section 3: Analytics ────────────────────────────────────── */}
          <Section id="analytics" icon={BarChart3} title="Analytics">
            <h3 className="text-base font-semibold mt-6 mb-2">What is tracked?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Storywidget tracks three event types automatically:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Story views — recorded when a visitor opens a story</li>
              <li>Slide views — recorded for each slide a visitor sees</li>
              <li>CTA clicks — recorded when a visitor clicks a CTA button</li>
            </ul>

            <h3 className="text-base font-semibold mt-6 mb-2">Metrics on the Analytics page</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Story views (total opens)</li>
              <li>Slide views (total slides seen)</li>
              <li>CTA clicks (total button clicks)</li>
              <li>CTR — CTA clicks divided by story views</li>
              <li>Completion rate — percentage of viewers who reached the last slide</li>
            </ul>

            <h3 className="text-base font-semibold mt-6 mb-2">Timeline chart</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The chart at the top of the Analytics page shows story views and CTA clicks over
              time. Use the 7 / 30 / 90 day toggle to change the time window.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Per-story breakdown</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The table below the chart shows metrics per story. Click the arrow icon on any row
              to open that story in the editor.
            </p>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground mt-6">
              💡 Analytics events are tracked via the widget embed on your site. Events only
              record when the widget is loaded by a visitor — previewing stories in the dashboard
              does not count as a view.
            </div>
          </Section>

          <Separator className="mt-16" />

          {/* ── Section 4: Embed & Integration ──────────────────────────── */}
          <Section id="embed" icon={Code2} title="Embed & Integration">
            <h3 className="text-base font-semibold mt-6 mb-2">Script tag embed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The simplest way to embed the widget. Paste this snippet before the closing{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code>{" "}
              tag on any page:
            </p>
            <pre
              className="rounded-xl border bg-zinc-950 text-zinc-100 px-5 py-4 text-sm overflow-x-auto"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              <code>{`<script
  src="https://cdn.storywidget.io/widget.js"
  data-api-key="YOUR_API_KEY"
  data-category="your-category-slug">
</script>`}</code>
            </pre>

            <h3 className="text-base font-semibold mt-6 mb-2">Attributes explained</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-api-key</code>{" "}
                (required) — your workspace API key from the API Keys page
              </li>
              <li>
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-category</code>{" "}
                (optional) — the category slug to display. If omitted, all published stories are
                shown
              </li>
              <li>
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-container</code>{" "}
                (optional) — CSS selector for the mount element. Defaults to{" "}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">#story-widget</code>
              </li>
              <li>
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-limit</code>{" "}
                (optional) — maximum number of stories to show
              </li>
            </ul>

            <h3 className="text-base font-semibold mt-6 mb-2">npm package</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              For React or other JS frameworks, install the package:
            </p>
            <pre
              className="rounded-xl border bg-zinc-950 text-zinc-100 px-5 py-4 text-sm overflow-x-auto"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              <code>npm install storywidget</code>
            </pre>

            <h3 className="text-base font-semibold mt-6 mb-2">Domain restrictions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The widget only loads on domains you have allowlisted in Settings → Allowed Domains.
              If your domain is not in the list, the widget will return a 403 error and not render.
            </p>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground mt-4">
              💡 Always add your production domain in Settings before going live. The widget is
              blocked on all domains until at least one is configured.
            </div>
          </Section>

          <Separator className="mt-16" />

          {/* ── Section 5: API Keys ──────────────────────────────────────── */}
          <Section id="api-keys" icon={KeyRound} title="API Keys">
            <h3 className="text-base font-semibold mt-6 mb-2">What are API keys?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              API keys authenticate the widget embed on your website. The widget sends your API
              key with every request to verify it belongs to your workspace and to enforce domain
              restrictions.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">How to create an API key</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Go to API Keys in the sidebar</li>
              <li>Click "Create key" and give it a descriptive name</li>
              <li>Copy the full key immediately — it is only shown once</li>
              <li>
                Paste it into your embed snippet as{" "}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-api-key</code>
              </li>
            </ol>

            <h3 className="text-base font-semibold mt-6 mb-2">Revoking a key</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the delete icon next to any key to revoke it immediately. Any embed using that
              key will stop working. Create a new key and update your embed snippet to restore the
              widget.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Security best practices</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>
                Never paste your API key into frontend JavaScript directly — always use the{" "}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">data-api-key</code>{" "}
                attribute on the script tag
              </li>
              <li>Rotate keys periodically and after any suspected exposure</li>
              <li>
                Use domain restrictions (Settings → Allowed Domains) as a second layer of security
              </li>
              <li>
                One key per site makes it easy to revoke access for a single property without
                affecting others
              </li>
            </ul>
          </Section>

          <Separator className="mt-16" />

          {/* ── Section 6: Billing ───────────────────────────────────────── */}
          <Section id="billing" icon={CreditCard} title="Billing">
            <h3 className="text-base font-semibold mt-6 mb-2">Plans</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two paid plans are available:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <span className="font-medium text-foreground">Pro</span> — $29/month. 50 stories,
              50,000 monthly views, 3 allowed domains, advanced analytics, custom branding,
              priority support.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <span className="font-medium text-foreground">Business</span> — $99/month. Unlimited
              stories and views, 10 allowed domains, all Pro features plus SLA support.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">How to upgrade</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Go to Billing in the sidebar</li>
              <li>Click "Upgrade" next to the plan you want</li>
              <li>Complete the Stripe checkout — your plan upgrades immediately</li>
              <li>Your new limits apply as soon as the payment is confirmed</li>
            </ol>

            <h3 className="text-base font-semibold mt-6 mb-2">How to downgrade</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Go to Billing → select a lower plan → confirm the change. Downgrades take effect at
              the end of your current billing period with prorated credit applied.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Cancellation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can cancel any time from the Billing page. Your subscription remains active
              until the end of the billing period. After cancellation your workspace reverts to
              the Free plan.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-2">Payment method</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To update your credit card go to Billing → Update payment method. Enter your new
              card details — it is saved securely via Stripe and set as the default for future
              invoices.
            </p>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground mt-4">
              💡 All payments are processed securely by Stripe. Storywidget never stores your
              card details.
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}