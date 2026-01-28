
export type DealStatus = 'open' | 'closed-won' | 'closed-lost';

export interface Deal {
  id: string;
  clientName: string;
  amount: number;
  status: DealStatus;
  isMonthlyRecurring: boolean;
  expectedCloseDate: string;
  actualCloseDate?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  status: 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture';
  addedDate: string;
  lastContactDate: string;
  address?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'contact' | 'thorne';
  text: string;
  timestamp: string;
  type?: 'email' | 'sms' | 'call_transcript';
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  lastMessage: string;
  lastActive: string;
  status: 'awaiting_reply' | 'responded' | 'thorne_handling';
  channel: 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp';
  unreadCount: number;
  messages?: Message[];
}

export interface Activity {
  id: string;
  type: 'Human' | 'Thorne' | 'Gift' | 'System' | 'Update';
  title: string;
  detail: string;
  date: string;
  icon?: string;
  oldValue?: string;
  newValue?: string;
}

export interface CampaignConfig {
  channels: string[];
  budget: number;
  aggressiveness: number; // 1-100
  products: string[];
  objective: string;
}

export interface InsightReport {
  summary: string;
  forecast: string;
  recommendations: string[];
}

export type OpportunityFilter = 'all' | 'open' | 'won' | 'lost';
export type DateFilterType = 'day' | 'month' | 'year' | 'custom';
