export const API_BASE_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "sw_jwt_token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    if (!token || token === "undefined" || token === "null") {
      console.warn("Blocked invalid token:", token);
      return;
    }
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export interface ApiError extends Error {
  status?: number;
  body?: unknown;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token && token !== "undefined") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let body: unknown;
    try {
      body = await res.json();
      const data = body as Record<string, unknown>;
      const raw = data["message"];
      message = Array.isArray(raw) ? raw.join(", ") : (raw as string) || (data["error"] as string) || message;
    } catch { /* ignore */ }
    const err = new Error(message) as ApiError;
    err.status = res.status;
    (err as ApiError & { body?: unknown }).body = body;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

export interface SlideCta {
  label: string;
  url: string;
}

export interface Slide {
  type: "image" | "video" | "html";
  url?: string;
  duration?: number;
  cta?: SlideCta;
}

export interface Story {
  id: string;
  workspace_id: string;
  category_id: string | null;
  title: string;
  status: "draft" | "published";
  slides: Slide[];
  config: Record<string, unknown>;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  font_family: string;
  custom_font_url: string | null;
  card_shape: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  key?: string;
  message?: string;
}

export function isPublished(story: Story): boolean {
  return story.status === "published";
}

export interface CreateStoryPayload {
  title: string;
  slides?: Slide[];
  thumbnail_url?: string | null;
  category_id?: string | null;
}

export interface UpdateStoryPayload {
  title?: string;
  slides?: Slide[];
  thumbnail_url?: string | null;
  status?: "draft";
  category_id?: string | null;
}

// ─────────────────────────────────────────────────────────────────
//  Auth
// ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user?: { email: string; name?: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
};

// ─────────────────────────────────────────────────────────────────
//  Categories
// ─────────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () =>
    apiFetch<Category[]>("/categories"),

  create: (name: string) =>
    apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: string, name: string) =>
    apiFetch<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),

  updateFont: (id: string, data: { font_family?: string; custom_font_url?: string | null }) =>
    apiFetch<Category>(`/categories/${id}/font`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadFont: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<{ url: string; category: Category }>(`/categories/${id}/font/upload`, {
      method: "POST",
      body: form,
    });
  },

  updateShape: (id: string, card_shape: string) =>
    apiFetch<Category>(`/categories/${id}/shape`, {
      method: "PATCH",
      body: JSON.stringify({ card_shape }),
    }),
};

// ─────────────────────────────────────────────────────────────────
//  Stories
// ─────────────────────────────────────────────────────────────────

export const storiesApi = {
  list: () =>
    apiFetch<Story[]>("/stories"),

  get: (id: string) =>
    apiFetch<Story>(`/stories/${id}`),

  create: (data: CreateStoryPayload) =>
    apiFetch<Story>("/stories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateStoryPayload) =>
    apiFetch<Story>(`/stories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/stories/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    apiFetch<Story>(`/stories/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    apiFetch<Story>(`/stories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    }),

  duplicate: (id: string) =>
    apiFetch<Story>(`/stories/${id}/duplicate`, {
      method: "POST",
    }),
};

// ─────────────────────────────────────────────────────────────────
//  API Keys
// ─────────────────────────────────────────────────────────────────

const LAST_API_KEY_STORAGE = "sw_last_api_key";

export const lastApiKeyStorage = {
  get(): string | null {
    try { return localStorage.getItem(LAST_API_KEY_STORAGE); } catch { return null; }
  },
  set(key: string) {
    try { localStorage.setItem(LAST_API_KEY_STORAGE, key); } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(LAST_API_KEY_STORAGE); } catch { /* ignore */ }
  },
};

export const apiKeysApi = {
  list: () =>
    apiFetch<ApiKey[]>("/api-keys"),

  create: async (name: string) => {
    const result = await apiFetch<ApiKey>("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    // Store full key temporarily so embed modal can use it without manual paste
    if (result.key) lastApiKeyStorage.set(result.key);
    return result;
  },

  delete: (id: string) =>
    apiFetch<void>(`/api-keys/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
//  Analytics
// ─────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  story_views: number;
  slide_views: number;
  cta_clicks: number;
  ctr: number;
}

export interface StoryAnalytics {
  story_id: string;
  story_views: number;
  slide_views: number;
  cta_clicks: number;
  completion_rate: number;
}

export interface AnalyticsTimeline {
  days: number;
  labels: string[];
  datasets: {
    story_views: number[];
    cta_clicks: number[];
  };
}

export const analyticsApi = {
  summary: () =>
    apiFetch<AnalyticsSummary>("/analytics/summary"),

  storyStats: (id: string) =>
    apiFetch<StoryAnalytics>(`/analytics/stories/${id}`),

  timeline: (days?: number) =>
    apiFetch<AnalyticsTimeline>(
      `/analytics/timeline?days=${days ?? 7}`
    ),
};

// ─────────────────────────────────────────────────────────────────
//  Billing
// ─────────────────────────────────────────────────────────────────

// Matches the PlanId type from the backend plans.config.ts
export type PlanId = "free" | "pro" | "business";

export interface BillingStatus {
  plan: PlanId;
  // null when on free plan or subscription not yet active
  subscription_status: string | null;
  // null when on free plan — now returned by the backend getStatus()
  stripe_subscription_id: string | null;
  limits: { maxStories: number | null; maxMonthlyViews: number | null; maxAllowedDomains?: number | null };
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const billingApi = {
  /** Fetch the current workspace's billing plan and limits. */
  status: () =>
    apiFetch<BillingStatus>("/billing/status"),

  /**
   * Create a Stripe Checkout session for a paid plan upgrade.
   * Returns a Stripe-hosted checkout URL to redirect the user to.
   */
  createCheckoutSession: (plan: "pro" | "business") =>
    apiFetch<{ url: string }>("/billing/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  /**
   * Create a Stripe Billing Portal session so Pro/Business users can
   * manage their subscription, update payment methods, and view invoices.
   */
  createPortalSession: () =>
    apiFetch<{ url: string }>("/billing/portal-session", {
      method: "POST",
    }),

  changePlan: (plan: 'pro' | 'business') =>
    apiFetch<BillingStatus>('/billing/change-plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  cancel: () =>
    apiFetch<{ success: boolean }>('/billing/cancel', { method: 'POST' }),

  reactivate: () =>
    apiFetch<{ success: boolean }>('/billing/reactivate', { method: 'POST' }),

  getPaymentMethod: () =>
    apiFetch<{ brand: string; last4: string; exp_month: number; exp_year: number } | null>(
      '/billing/payment-method'
    ),

  createSetupIntent: () =>
    apiFetch<{ client_secret: string }>('/billing/setup-intent', { method: 'POST' }),

  confirmPaymentMethod: (paymentMethodId: string) =>
    apiFetch<{ brand: string; last4: string; exp_month: number; exp_year: number } | null>(
      '/billing/confirm-payment-method',
      {
        method: 'POST',
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
      }
    ),
};

// ─────────────────────────────────────────────────────────────────
//  Auth extras
// ─────────────────────────────────────────────────────────────────

export const authExtrasApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
};

// ─────────────────────────────────────────────────────────────────
//  Global 401 interceptor (call once at app root)
// ─────────────────────────────────────────────────────────────────

export function setupAuthInterceptor() {
  const original = window.fetch;
  window.fetch = async (...args) => {
    const res = await original(...args);
    if (res.status === 401) {
      // Clone so body can still be read by the caller
      const clone = res.clone();
      try {
        const data = await clone.json();
        const msg: string = data?.message ?? "";
        if (
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("authentication") ||
          msg.toLowerCase().includes("workspace context")
        ) {
          tokenStorage.clear();
          window.location.href = "/login";
        }
      } catch { /* non-JSON 401 */ }
    }
    return res;
  };
}

// ─────────────────────────────────────────────────────────────────
//  Plan limit errors (HTTP 402)
// ─────────────────────────────────────────────────────────────────

export interface PlanLimitError {
  error: "PLAN_LIMIT_EXCEEDED";
  limit_type: "stories" | "views";
  current: number;
  limit: number;
  plan: "free" | "pro" | "business";
  upgrade_url: "/billing";
}

export function isPlanLimitError(error: unknown): error is PlanLimitError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as PlanLimitError).error === "PLAN_LIMIT_EXCEEDED"
  );
}

// ─────────────────────────────────────────────────────────────────
//  Workspace settings
// ─────────────────────────────────────────────────────────────────

export interface WorkspaceSettings {
  allowed_domains: string[];
  max_allowed_domains: number;
  plan: string;
}

export const workspacesApi = {
  getSettings: (): Promise<WorkspaceSettings> =>
    apiFetch<WorkspaceSettings>("/workspaces/settings"),

  updateAllowedDomains: (domains: string[]): Promise<WorkspaceSettings> =>
    apiFetch<WorkspaceSettings>("/workspaces/allowed-domains", {
      method: "POST",
      body: JSON.stringify({ domains }),
    }),
};

// ─────────────────────────────────────────────────────────────────
//  Admin
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
//  Public Plans (pricing page — no auth required)
// ─────────────────────────────────────────────────────────────────

export interface PublicPlanConfig {
  id: string;
  plan_id: string;
  display_name: string;
  price_monthly: number;     // cents
  max_stories: number;
  max_monthly_views: number;
  max_allowed_domains: number;
  is_active: boolean;
  sort_order: number;
  features: string[];
}

export const plansApi = {
  list: () => apiFetch<PublicPlanConfig[]>('/billing/plans'),
};

// ─────────────────────────────────────────────────────────────────
//  Plan management admin types
// ─────────────────────────────────────────────────────────────────

export interface PlanConfig {
  id: string;
  plan_id: string;
  display_name: string;
  price_monthly: number;        // in cents (e.g. 2900 = $29)
  stripe_price_id: string | null;
  max_stories: number;
  max_monthly_views: number;
  max_allowed_domains: number;
  is_active: boolean;
  sort_order: number;
  features: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanPayload {
  plan_id: string;
  display_name: string;
  price_monthly: number;       // cents
  stripe_price_id?: string | null;
  max_stories: number;
  max_monthly_views: number;
  max_allowed_domains: number;
  is_active?: boolean;
  sort_order: number;
  features: string[];
}

export interface WorkspaceRow {
  id: string;
  name: string;
  plan: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  allowed_domains: string[];
  story_count: number;
  owner_email: string;
}

export interface WorkspaceDetail extends WorkspaceRow {
  api_keys_count: number;
}

export interface UserRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
  workspace_id: string;
  plan: string;
}

export interface AdminStats {
  total_workspaces: number;
  total_users: number;
  plans: { free: number; pro: number; business: number };
  total_stories: number;
  total_events_this_month: number;
}

export type SubscriptionDetails =
  | { has_subscription: false }
  | {
      has_subscription: true;
      subscription_id: string;
      status: string;
      current_period_start: string;
      current_period_end: string;
      cancel_at_period_end: boolean;
      canceled_at: string | null;
      amount: number;
      currency: string;
      interval: string;
      payment_method: {
        brand: string | null;
        last4: string | null;
        exp_month: number | null;
        exp_year: number | null;
      } | null;
    };

export interface RecentCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  customer_email: string | null;
  description: string | null;
}

export interface RevenueOverview {
  mrr: number;
  active_subscriptions: number;
  recent_charges: RecentCharge[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  getStats: () =>
    apiFetch<AdminStats>("/admin/stats"),

  getWorkspaces: (page: number, limit: number) =>
    apiFetch<PaginatedResponse<WorkspaceRow>>(
      `/admin/workspaces?page=${page}&limit=${limit}`,
    ),

  getWorkspace: (id: string) =>
    apiFetch<WorkspaceDetail>(`/admin/workspaces/${id}`),

  overridePlan: (id: string, plan: "free" | "pro" | "business") =>
    apiFetch<{ success: boolean }>(`/admin/workspaces/${id}/override-plan`, {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  getUsers: (page: number, limit: number) =>
    apiFetch<PaginatedResponse<UserRow>>(
      `/admin/users?page=${page}&limit=${limit}`,
    ),

  setUserRole: (id: string, role: "user" | "admin") =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/set-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  getSubscriptionDetails: (workspaceId: string) =>
    apiFetch<SubscriptionDetails>(`/admin/workspaces/${workspaceId}/subscription`),

  cancelSubscription: (workspaceId: string) =>
    apiFetch<{ success: boolean; message: string; cancel_at_period_end: boolean }>(
      `/admin/workspaces/${workspaceId}/cancel-subscription`,
      { method: "POST" },
    ),

  getRevenue: () =>
    apiFetch<RevenueOverview>("/admin/revenue"),

  getPlans: () =>
    apiFetch<PlanConfig[]>('/admin/plans'),

  updatePlan: (
    planId: string,
    data: Partial<Omit<PlanConfig, 'id' | 'plan_id' | 'created_at' | 'updated_at'>>
  ) =>
    apiFetch<PlanConfig>(`/admin/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  togglePlan: (planId: string) =>
    apiFetch<PlanConfig>(`/admin/plans/${planId}/toggle`, { method: 'POST' }),

  createPlan: (data: CreatePlanPayload) =>
    apiFetch<PlanConfig>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};