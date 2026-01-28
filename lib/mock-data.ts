import type { Deal, Contact, Conversation, DateFilterType } from '@/types'

export type { Deal, Contact, Conversation, DateFilterType }

export const mockDeals: Deal[] = [
  {
    id: '1',
    clientName: 'Acme Corp',
    amount: 25000,
    status: 'closed-won',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-15',
    actualCloseDate: '2024-01-12',
    createdAt: '2023-12-01'
  },
  {
    id: '2',
    clientName: 'TechVentures LLC',
    amount: 15500,
    status: 'open',
    isMonthlyRecurring: true,
    expectedCloseDate: '2024-02-28',
    createdAt: '2024-01-05'
  },
  {
    id: '3',
    clientName: 'GlobalStart Inc',
    amount: 32000,
    status: 'closed-won',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-20',
    actualCloseDate: '2024-01-18',
    createdAt: '2023-11-15'
  },
  {
    id: '4',
    clientName: 'Innovate Partners',
    amount: 8500,
    status: 'open',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-03-10',
    createdAt: '2024-01-10'
  },
  {
    id: '5',
    clientName: 'Summit Solutions',
    amount: 12000,
    status: 'closed-lost',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-08',
    createdAt: '2023-12-20'
  },
  {
    id: '6',
    clientName: 'NexGen Labs',
    amount: 45000,
    status: 'open',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-04-15',
    createdAt: '2024-01-02'
  },
  {
    id: '7',
    clientName: 'DataFlow Systems',
    amount: 18000,
    status: 'closed-won',
    isMonthlyRecurring: true,
    expectedCloseDate: '2024-01-25',
    actualCloseDate: '2024-01-22',
    createdAt: '2023-12-05'
  },
  {
    id: '8',
    clientName: 'CloudScale Pro',
    amount: 22000,
    status: 'closed-lost',
    isMonthlyRecurring: false,
    expectedCloseDate: '2024-01-30',
    createdAt: '2023-12-28'
  }
]

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@acmecorp.com',
    company: 'Acme Corp',
    status: 'Hot',
    addedDate: '2024-01-05',
    lastContactDate: '2024-01-20'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Torres',
    email: 'm.torres@techventures.io',
    company: 'TechVentures LLC',
    status: 'Withering',
    addedDate: '2023-12-15',
    lastContactDate: '2024-01-02'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Watson',
    email: 'emily.w@globalstart.com',
    company: 'GlobalStart Inc',
    status: 'New',
    addedDate: '2024-01-18',
    lastContactDate: '2024-01-18'
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Park',
    email: 'jpark@innovatepartners.co',
    company: 'Innovate Partners',
    status: 'Withering',
    addedDate: '2023-11-28',
    lastContactDate: '2023-12-28'
  },
  {
    id: '5',
    firstName: 'Rachel',
    lastName: 'Kumar',
    email: 'r.kumar@summitsolutions.net',
    company: 'Summit Solutions',
    status: 'Dead',
    addedDate: '2023-10-15',
    lastContactDate: '2023-12-01'
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.m@nexgenlabs.io',
    company: 'NexGen Labs',
    status: 'Hot',
    addedDate: '2024-01-02',
    lastContactDate: '2024-01-22'
  },
  {
    id: '7',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'l.anderson@dataflow.com',
    company: 'DataFlow Systems',
    status: 'Retouch',
    addedDate: '2023-12-10',
    lastContactDate: '2024-01-10'
  },
  {
    id: '8',
    firstName: 'Kevin',
    lastName: 'Nguyen',
    email: 'k.nguyen@cloudscale.pro',
    company: 'CloudScale Pro',
    status: 'Recapture',
    addedDate: '2023-11-05',
    lastContactDate: '2024-01-05'
  },
  {
    id: '9',
    firstName: 'Anna',
    lastName: 'Petrov',
    email: 'anna.p@enterprise.co',
    company: 'Enterprise Solutions',
    status: 'Hot',
    addedDate: '2024-01-12',
    lastContactDate: '2024-01-21'
  },
  {
    id: '10',
    firstName: 'Tom',
    lastName: 'Williams',
    email: 't.williams@scaleup.io',
    company: 'ScaleUp Inc',
    status: 'Needs Update',
    addedDate: '2023-12-20',
    lastContactDate: '2024-01-08'
  },
  {
    id: '11',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@fusion.tech',
    company: 'Fusion Technologies',
    status: 'New',
    addedDate: '2024-01-19',
    lastContactDate: '2024-01-19'
  }
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'Sarah Chen',
    lastMessage: 'Looking forward to the demo tomorrow!',
    lastActive: '2024-01-22T14:30:00Z',
    status: 'responded',
    channel: 'Email',
    unreadCount: 0
  },
  {
    id: '2',
    contactId: '6',
    contactName: 'David Martinez',
    lastMessage: 'Can we schedule a follow-up call?',
    lastActive: '2024-01-22T10:15:00Z',
    status: 'awaiting_reply',
    channel: 'LinkedIn',
    unreadCount: 1
  },
  {
    id: '3',
    contactId: '9',
    contactName: 'Anna Petrov',
    lastMessage: 'Thorne is handling the initial outreach...',
    lastActive: '2024-01-21T16:45:00Z',
    status: 'thorne_handling',
    channel: 'SMS',
    unreadCount: 0
  },
  {
    id: '4',
    contactId: '7',
    contactName: 'Lisa Anderson',
    lastMessage: 'Let me review the proposal and get back to you.',
    lastActive: '2024-01-20T09:00:00Z',
    status: 'awaiting_reply',
    channel: 'Email',
    unreadCount: 2
  }
]
