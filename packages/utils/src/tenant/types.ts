export interface Tenant {
  id: string;
  slug: string;
  name: string;
  customDomain?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  plan?: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial";
}

export interface TenantContext {
  tenant: Tenant;
  tenantId: string;
}