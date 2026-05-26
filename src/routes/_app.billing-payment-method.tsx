import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { billingApi } from "@/lib/api";

export const Route = createFileRoute("/_app/billing-payment-method")({
  component: PaymentMethodPage,
});

// ─── Module-level Stripe init (never recreated) ──────────────────────────────

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      fontFamily: "inherit",
      "::placeholder": { color: "#a1a1aa" },
    },
    invalid: { color: "#ef4444" },
  },
  hidePostalCode: false,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CardInfo = {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
};

// ─── Outer component — provides Elements context ──────────────────────────────

function PaymentMethodPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodForm />
    </Elements>
  );
}

// ─── Inner component — consumes Stripe hooks ─────────────────────────────────

function PaymentMethodForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [currentCard, setCurrentCard] = useState<CardInfo | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSetupIntent, setLoadingSetupIntent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing card on mount
  useEffect(() => {
    billingApi
      .getPaymentMethod()
      .then((card) => setCurrentCard(card))
      .catch(() => toast.error("Failed to load payment method."))
      .finally(() => setLoadingCard(false));
  }, []);

  async function handleStartReplace() {
    setLoadingSetupIntent(true);
    try {
      const { client_secret } = await billingApi.createSetupIntent();
      setClientSecret(client_secret);
      setShowForm(true);
    } catch {
      toast.error("Failed to initialize card form. Please try again.");
    } finally {
      setLoadingSetupIntent(false);
    }
  }

  async function handleSubmitCard() {
    if (!clientSecret) {
        toast.error("Setup not ready. Please try again.");
        return;
    }
    if (!stripe || !elements) {
        toast.error("Stripe is still loading. Please wait a moment and try again.");
        return;
    }

    setSubmitting(true);
    setStripeError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        toast.error("Card form not found. Please refresh and try again.");
        setSubmitting(false);
        return;
    }

    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
    });

    if (error) {
        setStripeError(error.message ?? "An error occurred. Please try again.");
        setSubmitting(false);
        return;
    }

    const paymentMethodId =
        typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;

    if (!paymentMethodId) {
        setStripeError("Could not retrieve payment method. Please try again.");
        setSubmitting(false);
        return;
    }

    try {
        const updated = await billingApi.confirmPaymentMethod(paymentMethodId);
        setCurrentCard(updated);
        setShowForm(false);
        setClientSecret(null);
        setSuccess(true);
        setSubmitting(false);
        toast.success("Card updated successfully!");
        setTimeout(() => navigate({ to: "/billing" }), 2000);
    } catch {
        setStripeError(
        "Card saved with Stripe but failed to attach to subscription. Please contact support."
        );
        setSubmitting(false);
    }
    }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="-ml-2">
        <Link to="/billing">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Billing
        </Link>
      </Button>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Payment Method</h1>
        <p className="text-muted-foreground">
          Update the card used for your subscription.
        </p>
      </div>

      {/* ── Card 1: Current Card ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Current Card</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCard ? (
            <div className="h-12 rounded bg-muted animate-pulse" />
          ) : currentCard ? (
            <div className="flex items-center gap-3">
              <CreditCard className="text-muted-foreground shrink-0" size={24} />
              <div>
                <p className="font-medium capitalize">
                  {currentCard.brand} •••• {currentCard.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {currentCard.exp_month}/{currentCard.exp_year}
                </p>
              </div>
              <CheckCircle2 className="text-green-500 ml-auto shrink-0" size={20} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard size={20} />
              <span>No payment method on file.</span>
            </div>
          )}
        </CardContent>

        {!showForm && !success && (
          <CardFooter>
            <Button onClick={handleStartReplace} disabled={loadingSetupIntent}>
              {loadingSetupIntent ? (
                <>
                  <RefreshCw className="animate-spin mr-1.5" size={14} />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-1.5" size={14} />
                  Replace card
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* ── Success state ────────────────────────────────────────────────── */}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Card updated successfully. Redirecting to billing...
          </AlertDescription>
        </Alert>
      )}

      {/* ── Card 2: New Card Form ────────────────────────────────────────── */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Card Details</CardTitle>
            <CardDescription>
              Your card details are handled securely by Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="border rounded-md p-3 bg-background"
              style={{ minHeight: "44px" }}
            >
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            {stripeError && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle size={16} />
                <AlertDescription>{stripeError}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={12} />
              Secured by Stripe. We never store your card details.
            </p>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
                onClick={handleSubmitCard}
                disabled={submitting || !clientSecret || !stripe || !elements}
                className="flex-1"
                >
                {submitting ? (
                    <>
                    <RefreshCw className="animate-spin mr-1.5" size={14} />
                    Saving card...
                    </>
                ) : !stripe || !elements ? (
                    <>
                    <RefreshCw className="animate-spin mr-1.5" size={14} />
                    Loading Stripe...
                    </>
                ) : (
                    "Save card"
                )}
                </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setStripeError(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}