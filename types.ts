
import { ReactNode } from 'react';

export interface FeedCardData {
  id: string;
  icon: ReactNode;
  label: string;
  value: string;
  subValueLabel?: string;
  accentColor: string;
}

// Fix: Added missing UserRole type for personnel categorization
export type UserRole = 'Admin' | 'VP' | 'Director' | 'Manager' | 'User' | 'IT' | 'Marketing';

// Fix: Added missing User interface for network hierarchy management
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  permissions: UserRole;
  parentId?: string;
}

// Fix: Added missing AuditEntry interface for tracking system changes
export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE';
  details: string;
}

// Fix: Added missing AIProvider enum for intelligence matrix configuration
export enum AIProvider {
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
  GOOGLE = 'Google',
}

// Fix: Added missing TenantConfig interface for comprehensive node infrastructure
export interface TenantConfig {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerJobTitle: string;
  ownerPhone: string;
  tenantName: string;
  companyAddress: string;
  supabase: {
    url: string;
    anonKey: string;
    serviceRole: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  zoom: {
    clientId: string;
    clientSecret: string;
    accountId: string;
  };
  ai: {
    provider: AIProvider;
    apiKey: string;
  };
  mailgun: {
    domain: string;
    apiKey: string;
  };
  dns: {
    provider: string;
    apiKey: string;
    domain: string;
  };
  gifting: {
    postalyticsKey: string;
    sendosoKey: string;
  };
}

// Fix: Added missing ProductSelection interface for account packaging
export interface ProductSelection {
  agyantos: boolean;
  agyantsync: boolean;
  thorneNeural: boolean;
}

// Fix: Added missing Financials interface for settlement node configuration
export interface Financials {
  basePrice: number;
  discount: number;
  paymentStatus: 'pending' | 'sent' | 'collected';
}

// Fix: Added missing Governance interface for legal packet dispatch
export interface Governance {
  tos: boolean;
  privacy: boolean;
  mua: boolean;
}

// Fix: Added missing TenantMode enum for instance type selection
export enum TenantMode {
  INDIVIDUAL = 'INDIVIDUAL',
  MULTI_TENANT = 'MULTI_TENANT',
  EXISTING = 'EXISTING',
}

// Fix: Added missing WizardStep type for provisioning flow tracking
export type WizardStep = number;

// Fix: Added missing CustomerFormData interface for identity initialization
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

// Fix: Added missing InputProps interface for atomic UI components
export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
  icon?: ReactNode;
}
