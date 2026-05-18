import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Sparkles, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { billingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const FREE_FEATURES  = ["5 stories", "1,000 monthly views", "Basic analytics", "Widget embed", "API access"];
const PRO_FEATURES   = ["Unlimited stories", "Unlimited monthly views", "Advanced analytics", "Widget embed", "API access", "Custom branding", "Priority support"];

function PricingPage() {
  const { isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handlePro = async () => {
    if (!isAuthenticated) { navigate({ to: "/register" }); return; }
    setUpgrading(true);
    try {
      const { url } = await billingApi.createCheckoutSession("pro");
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout.");
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Storywidget</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
          Start free. Upgrade when you're ready. No hidden fees.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Free */}
          <Card className="shadow-soft border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Free</CardTitle>
              <CardDescription>Perfect for getting started.</CardDescription>
              <div className="flex items-end gap-1 pt-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Go to dashboard" : "Get started free"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="shadow-elevated border-primary/30 relative overflow-hidden">
            {/* Highlight strip */}
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: "var(--gradient-brand)" }} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pro</CardTitle>
                <Badge className="text-xs" style={{ background: "var(--gradient-brand)", color: "white", border: "none" }}>
                  Most popular
                </Badge>
              </div>
              <CardDescription>For teams that need more.</CardDescription>
              <div className="flex items-end gap-1 pt-2">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={handlePro} disabled={upgrading}>
                {upgrading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
                  : <><Zap className="mr-2 h-4 w-4" />{isAuthenticated ? "Upgrade to Pro" : "Get started"}</>
                }
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature comparison table */}
        <Card className="shadow-soft mt-10">
          <CardHeader>
            <CardTitle className="text-base">Full comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground w-1/2">Feature</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Free</th>
                  <th className="text-center px-4 py-3 font-medium text-primary">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Stories",          "5",         "Unlimited"],
                  ["Monthly views",    "1,000",     "Unlimited"],
                  ["Analytics",        "Basic",     "Advanced"],
                  ["Widget embed",     "✓",         "✓"],
                  ["API access",       "✓",         "✓"],
                  ["Custom branding",  "—",         "✓"],
                  ["Priority support", "—",         "✓"],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-3 text-muted-foreground">{feature}</td>
                    <td className="px-4 py-3 text-center">{free}</td>
                    <td className="px-4 py-3 text-center font-medium text-primary">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include SSL encryption and 99.9% uptime SLA. Questions?{" "}
          <a href="mailto:support@storywidget.com" className="text-primary hover:underline">Contact us</a>
        </p>
      </section>
    </div>
  );
}