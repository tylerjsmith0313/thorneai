
import { ReactNode } from 'react';

export type UserRole = 'Admin' | 'VP' | 'Director' | 'Manager' | 'User' | 'IT' | 'Marketing';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string; // Multi-tenant partition key
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  permissions: UserRole;
  parentId?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string; // Multi-tenant partition key
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: string;
  added_date: string;
  created_by: string;
  assigned_to_email?: string;
  // Metadata for Thorne Neural Network
  website_url?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  research_notes?: string;
  summary?: string;
}

export interface FeedCardData {
  id: string;
  icon: ReactNode;
  label: string;
  value: string;
  subValueLabel?: string;
  accentColor: string;
}

export interface AuditEntry {
  id: string;
  tenant_id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE';
  details: string;
}

export enum AIProvider {
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
  GOOGLE = 'Google',
}

// Added missing exports for UI components
export interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
  icon?: ReactNode;
}

export interface TenantConfig {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerJobTitle: string;
  ownerPhone: string;
  tenantName: string;
  companyAddress: string;
  supabase: { url: string; anonKey: string; serviceRole: string };
  stripe: { secretKey: string; publishableKey: string; webhookSecret: string };
  twilio: { accountSid: string; authToken: string; fromNumber: string };
  zoom: { clientId: string; clientSecret: string; accountId: string };
  ai: { provider: AIProvider; apiKey: string };
  mailgun: { domain: string; apiKey: string };
  dns: { provider: string; apiKey: string; domain: string };
  gifting: { postalyticsKey: string; sendosoKey: string };
}

export interface ProductSelection {
  agyantos: boolean;
  agyantsync: boolean;
  thorneNeural: boolean;
}

export interface Financials {
  basePrice: number;
  discount: number;
  paymentStatus: 'pending' | 'sent' | 'collected';
}

export interface Governance {
  tos: boolean;
  privacy: boolean;
  mua: boolean;
}

export enum TenantMode {
  INDIVIDUAL = 'INDIVIDUAL',
  MULTI_TENANT = 'MULTI_TENANT',
  EXISTING = 'EXISTING',
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
