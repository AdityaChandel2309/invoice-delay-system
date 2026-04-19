const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ── Customers ────────────────────────────────────────────────
export const customersApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    apiCall<unknown[]>(`/customers?skip=${params?.skip || 0}&limit=${params?.limit || 50}`),
  get: (id: string) => apiCall<unknown>(`/customers/${id}`),
  create: (data: unknown) => apiCall<unknown>("/customers", { method: "POST", body: JSON.stringify(data) }),
};

// ── Invoices ─────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.skip) qs.set("skip", String(params.skip));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    return apiCall<unknown[]>(`/invoices?${qs}`);
  },
  get: (id: string) => apiCall<unknown>(`/invoices/${id}`),
  create: (data: unknown) => apiCall<unknown>("/invoices", { method: "POST", body: JSON.stringify(data) }),
};

// ── Predictions ──────────────────────────────────────────────
export const predictionsApi = {
  single: (invoiceId: string) =>
    apiCall<unknown>(`/predictions/single/${invoiceId}`, { method: "POST" }),
  batch: (invoiceIds: string[]) =>
    apiCall<unknown>("/predictions/batch", { method: "POST", body: JSON.stringify({ invoice_ids: invoiceIds }) }),
  history: (invoiceId: string) =>
    apiCall<unknown[]>(`/predictions/history/${invoiceId}`),
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  kpiSummary: () => apiCall<unknown>("/dashboard/kpi"),
  monthlyTrend: () => apiCall<unknown[]>("/dashboard/trend"),
  agingBuckets: () => apiCall<unknown[]>("/dashboard/aging"),
  highRiskCustomers: () => apiCall<unknown[]>("/dashboard/high-risk"),
  delayDistribution: () => apiCall<unknown[]>("/dashboard/distribution"),
};
