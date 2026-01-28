import { Deal, Contact, Conversation } from './types';

export const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    clientName: 'Acme Corp',
    amount: 15000,
    status: 'closed-won',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-15',
    actualCloseDate: '2024-01-12',
    createdAt: '2023-12-01'
  },
  {
    id: '2',
    clientName: 'Global Tech',
    amount: 2500,
    status: 'open',
    isMonthlyRecurring: true,
    expectedCloseDate: '2024-02-28',
    createdAt: '2024-01-05'
  },
  {
    id: '3',
    clientName: 'Starlight Solutions',
    amount: 8500,
    status: 'open',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-03-10',
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    clientName: 'Blue Harbor',
    amount: 12000,
    status: 'closed-won',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-30',
    actualCloseDate: '2024-01-28',
    createdAt: '2023-11-15'
  },
  {
    id: '5',
    clientName: 'Zenith Systems',
    amount: 4500,
    status: 'open',
    isMonthlyRecurring: true,
    expectedCloseDate: '2024-04-01',
    createdAt: '2024-02-01'
  },
  {
    id: '6',
    clientName: 'Nexus Labs',
    amount: 30000,
    status: 'closed-won',
    isMonthlyRecurring: false,
    expectedCloseDate: '2023-12-15',
    actualCloseDate: '2023-12-14',
    createdAt: '2023-10-01'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john@acme.com', company: 'Acme Corp', status: 'Hot', addedDate: '2024-03-15', lastContactDate: '2024-03-16' },
  { id: 'c2', firstName: 'Jane', lastName: 'Smith', email: 'jane@global.com', company: 'Global Tech', status: 'New', addedDate: '2024-03-14', lastContactDate: '2024-03-14' },
  { id: 'c3', firstName: 'Robert', lastName: 'Brown', email: 'rob@starlight.io', company: 'Starlight Solutions', status: 'Withering', addedDate: '2024-02-28', lastContactDate: '2024-03-01' },
  { id: 'c4', firstName: 'Alice', lastName: 'Johnson', email: 'alice@blue.com', company: 'Blue Harbor', status: 'Hot', addedDate: '2024-03-10', lastContactDate: '2024-03-15' },
  { id: 'c5', firstName: 'Michael', lastName: 'Wilson', email: 'mike@zenith.com', company: 'Zenith Systems', status: 'Needs Update', addedDate: '2024-03-12', lastContactDate: '2024-03-13' },
  { id: 'c6', firstName: 'Sarah', lastName: 'Davis', email: 'sarah@nexus.com', company: 'Nexus Labs', status: 'Recapture', addedDate: '2023-12-15', lastContactDate: '2024-01-10' },
  { id: 'c7', firstName: 'David', lastName: 'Miller', email: 'david@miller.co', company: 'Miller Co', status: 'Dead', addedDate: '2024-01-20', lastContactDate: '2024-02-01' },
  { id: 'c8', firstName: 'Emily', lastName: 'Taylor', email: 'emily@tech.io', company: 'Tech Nova', status: 'New', addedDate: '2024-03-16', lastContactDate: '2024-03-16' },
  { id: 'c9', firstName: 'Kevin', lastName: 'Hart', email: 'kevin@comedy.com', company: 'Laughter Inc', status: 'Withering', addedDate: '2024-02-15', lastContactDate: '2024-02-20' },
  { id: 'c10', firstName: 'Lisa', lastName: 'Kudrow', email: 'lisa@central.com', company: 'Central Perk', status: 'Retouch', addedDate: '2024-01-05', lastContactDate: '2024-01-20' },
  { id: 'c11', firstName: 'Matt', lastName: 'LeBlanc', email: 'matt@acting.com', company: 'TV Studios', status: 'Retouch', addedDate: '2023-11-20', lastContactDate: '2023-12-05' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    contactId: 'c1',
    contactName: 'John Doe',
    lastMessage: 'Looking forward to the proposal tomorrow.',
    lastActive: '2024-03-16T14:30:00Z',
    status: 'awaiting_reply',
    channel: 'Email',
    unreadCount: 1
  },
  {
    id: 'conv2',
    contactId: 'c2',
    contactName: 'Jane Smith',
    lastMessage: 'Thorne: I have scheduled the meeting for Friday at 2 PM.',
    lastActive: '2024-03-16T10:15:00Z',
    status: 'thorne_handling',
    channel: 'SMS',
    unreadCount: 0
  },
  {
    id: 'conv3',
    contactId: 'c4',
    contactName: 'Alice Johnson',
    lastMessage: 'Great, thanks for the update.',
    lastActive: '2024-03-15T16:45:00Z',
    status: 'responded',
    channel: 'LinkedIn',
    unreadCount: 0
  },
  {
    id: 'conv4',
    contactId: 'c8',
    contactName: 'Emily Taylor',
    lastMessage: 'Can we discuss the budget again?',
    lastActive: '2024-03-16T09:00:00Z',
    status: 'awaiting_reply',
    channel: 'WhatsApp',
    unreadCount: 2
  }
];
