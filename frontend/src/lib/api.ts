import {
  AIInsight,
  CollectionStep,
  CommunicationLog,
  Contact,
  InvoiceDetail,
  NextAction,
  ReminderPreview,
} from '@/types/invoice';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

export const mockInvoiceDetail: InvoiceDetail = {
  id: 'INV-2024-0847',
  client: 'Northgate Medical Group',
  amountDue: 24750,
  dueDate: 'June 15, 2026',
  daysOverdue: 22,
  status: 'Overdue',
  riskLevel: 'Medium',
  strategy: 'Auto-Collection v2',
  collectionProgress: {
    currentStep: 3,
    totalSteps: 6,
    percentComplete: 40,
    currentStage: 'Reminder SMS',
    initiatedLabel: 'Initiated Jun 15',
  },
};

const mockInvoiceDetails: Record<string, InvoiceDetail> = {
  'INV-2024-0847': mockInvoiceDetail,
  'INV-2024-0731': {
    id: 'INV-2024-0731',
    client: 'Pinebrook Solutions',
    amountDue: 8200,
    dueDate: 'June 24, 2026',
    daysOverdue: 8,
    status: 'In Progress',
    riskLevel: 'Low',
    strategy: 'Auto-Collection v2',
    collectionProgress: {
      currentStep: 3,
      totalSteps: 6,
      percentComplete: 40,
      currentStage: 'Reminder SMS',
      initiatedLabel: 'Initiated Jun 24',
    },
  },
  'INV-2024-0612': {
    id: 'INV-2024-0612',
    client: 'Meridian Design Co.',
    amountDue: 3500,
    dueDate: 'May 17, 2026',
    daysOverdue: 45,
    status: 'Escalated',
    riskLevel: 'High',
    strategy: 'Escalation Email',
    collectionProgress: {
      currentStep: 5,
      totalSteps: 6,
      percentComplete: 80,
      currentStage: 'Escalation Email',
      initiatedLabel: 'Initiated May 17',
    },
  },
  'INV-2024-0889': {
    id: 'INV-2024-0889',
    client: 'Vertex Analytics',
    amountDue: 41500,
    dueDate: 'April 20, 2026',
    daysOverdue: 73,
    status: 'Critical',
    riskLevel: 'High',
    strategy: 'Collections Referral',
    collectionProgress: {
      currentStep: 6,
      totalSteps: 6,
      percentComplete: 100,
      currentStage: 'Collections Referral',
      initiatedLabel: 'Initiated Apr 20',
    },
  },
};

const timelineSeeds: CollectionStep[] = [
  {
    day: 0,
    title: 'Invoice Issued',
    description: 'Initial invoice delivered to client billing contact via email',
    date: 'Jun 15, 2026',
    status: 'completed',
    icon: 'check',
  },
  {
    day: 3,
    title: 'Friendly Email',
    description: 'Courtesy payment reminder dispatched automatically',
    date: 'Jun 18, 2026',
    status: 'completed',
    icon: 'check',
  },
  {
    day: 7,
    title: 'Reminder SMS',
    description: 'Automated SMS notification sent to registered billing contact',
    date: 'Jun 22, 2026',
    status: 'active',
    icon: 'message',
  },
  {
    day: 14,
    title: 'Phone Call',
    description: 'Personal follow-up call from accounts receivable team',
    date: 'Jun 29, 2026',
    status: 'pending',
    icon: 'phone',
  },
  {
    day: 21,
    title: 'Escalation Email',
    description: 'Formal escalation notice to management',
    date: 'Jul 6, 2026',
    status: 'pending',
    icon: 'alert',
  },
  {
    day: 30,
    title: 'Collections Referral',
    description: 'Invoice referred to external collections agency',
    date: 'Jul 15, 2026',
    status: 'pending',
    icon: 'clock',
  },
];

function timelineForInvoice(invoice: InvoiceDetail): CollectionStep[] {
  if (invoice.daysOverdue >= 60) {
    return timelineSeeds.map((step) => ({ ...step, status: 'completed' }));
  }

  if (invoice.daysOverdue >= 30) {
    return timelineSeeds.map((step) => ({
      ...step,
      status: step.day < 21 ? 'completed' : step.day === 21 ? 'active' : 'pending',
    }));
  }

  return timelineSeeds;
}

export const mockCollectionTimeline: CollectionStep[] = timelineForInvoice(mockInvoiceDetail);

const primaryContacts: Record<string, Contact> = {
  'INV-2024-0847': {
    name: 'Sarah Mitchell',
    role: 'Accounts Payable Manager',
    email: 's.mitchell@northgatemedical.com',
    phone: '+1 (555) 847-2193',
    lastContact: 'Jun 22, 2026',
    responseRate: 60,
  },
  'INV-2024-0731': {
    name: 'Daniel Park',
    role: 'Finance Coordinator',
    email: 'd.park@pinebrooksolutions.com',
    phone: '+1 (555) 302-1844',
    lastContact: 'Jul 2, 2026',
    responseRate: 82,
  },
  'INV-2024-0612': {
    name: 'Maya Chen',
    role: 'Controller',
    email: 'm.chen@meridiandesign.co',
    phone: '+1 (555) 430-7712',
    lastContact: 'Jun 29, 2026',
    responseRate: 44,
  },
  'INV-2024-0889': {
    name: 'Alex Rivera',
    role: 'VP Finance',
    email: 'a.rivera@vertexanalytics.com',
    phone: '+1 (555) 901-0889',
    lastContact: 'Jul 21, 2026',
    responseRate: 28,
  },
};

export const mockPrimaryContact: Contact = primaryContacts['INV-2024-0847'];

function contactForInvoice(id: string): Contact {
  return primaryContacts[id] ?? mockPrimaryContact;
}

function invoiceForId(id: string): InvoiceDetail {
  return mockInvoiceDetails[id] ?? { ...mockInvoiceDetail, id };
}

function shortInvoiceId(id: string): string {
  return id.split('-').at(-1) ?? id;
}

function communicationHistoryForInvoice(invoice: InvoiceDetail): CommunicationLog[] {
  const contact = contactForInvoice(invoice.id);
  const shortId = shortInvoiceId(invoice.id);
  const amount = `$${invoice.amountDue.toLocaleString()}`;

  if (invoice.daysOverdue >= 60) {
    return [
      {
        id: `${invoice.id}-COMM-001`,
        type: 'invoice_delivery',
        title: 'Invoice Delivery',
        date: 'Apr 20, 2026',
        time: '9:00 AM',
        status: 'delivered',
        content: `Invoice ${invoice.id} delivered to ${contact.email} for ${invoice.client}.`,
      },
      {
        id: `${invoice.id}-COMM-002`,
        type: 'email',
        title: 'Escalation Notice',
        date: 'May 11, 2026',
        time: '9:14 AM',
        status: 'delivered',
        content: `Formal escalation sent for ${invoice.id} after repeated missed payment windows.`,
      },
      {
        id: `${invoice.id}-COMM-003`,
        type: 'phone',
        title: 'Collections Call',
        date: 'Jul 21, 2026',
        time: '10:30 AM',
        status: 'sent',
        content: `Final collection follow-up queued for invoice #${shortId} (${amount}).`,
      },
    ];
  }

  return [
    {
      id: `${invoice.id}-COMM-001`,
      type: 'invoice_delivery',
      title: 'Invoice Delivery',
      date: 'Jun 15, 2026',
      time: '9:00 AM',
      status: 'delivered',
      content:
        `Hi ${contact.name.split(' ')[0]}, please find attached invoice ${invoice.id} for services rendered in May 2026. Payment is due by June 15.`,
    },
    {
      id: `${invoice.id}-COMM-002`,
      type: 'email',
      title: 'Friendly Reminder',
      date: 'Jun 18, 2026',
      time: '9:14 AM',
      status: 'delivered',
      content:
        `Hi ${contact.name.split(' ')[0]}, just a friendly reminder that invoice ${invoice.id} for ${amount}.00 was due June 15. Please let us know if you need...`,
    },
    {
      id: `${invoice.id}-COMM-003`,
      type: 'sms',
      title: 'SMS Reminder',
      date: 'Jun 22, 2026',
      time: '10:30 AM',
      status: 'sent',
      content:
        `Reminder: Invoice #${shortId} (${amount}) was due Jun 15. Pay securely at: [link] · Reply STOP to opt out.`,
    },
  ];
}

function nextActionForInvoice(invoice: InvoiceDetail): NextAction {
  if (invoice.daysOverdue >= 60) {
    return {
      action: 'Collections Referral',
      scheduledDate: 'Jul 26, 2026',
      scheduledTime: '10:30 AM',
      workflow: 'Auto-Collection v2',
      priority: 'high',
    };
  }

  return mockNextAction;
}

function insightForInvoice(invoice: InvoiceDetail): AIInsight {
  if (invoice.daysOverdue >= 60) {
    return {
      summary:
        'High-risk account with limited recent response. Prioritize executive outreach and preserve a complete communication trail before referral.',
      recommendedAction: 'Prepare collections referral',
      optimalContactTime: 'Jul 26, 2026',
    };
  }

  return mockAIInsight;
}

function reminderForInvoice(invoice: InvoiceDetail): ReminderPreview {
  const contact = contactForInvoice(invoice.id);
  const amount = `$${invoice.amountDue.toLocaleString()}.00`;
  const dueDate = invoice.dueDate;
  const firstName = contact.name.split(' ')[0];

  return {
    from: 'AR Team <collections@yourcompany.com>',
    to: contact.email,
    subject: `Payment Reminder — ${invoice.id} · ${amount} Overdue`,
    body: `Hi ${firstName},

I hope this message finds you well. I'm reaching out regarding invoice ${invoice.id} for ${amount}, which was due on ${dueDate} and is currently ${invoice.daysOverdue} days past due.

We understand that oversights happen, and we would love to work with you to resolve this promptly. Could you let us know the expected payment date, or if there is any issue with the invoice that we can help address?

You can pay securely online at any time using the link below, or contact our accounts receivable team directly at (800) 555-0192.

Pay Invoice — ${amount}
Secure payment · ${invoice.id}

Thank you for your attention to this matter. We value our partnership with ${invoice.client} and look forward to resolving this quickly.

Warm regards,
Accounts Receivable Team
YourCompany · collections@yourcompany.com`,
    generatedAt: 'Jun 22, 2026 at 10:15 AM',
    status: 'pending_approval',
  };
}

export const mockPrimaryContactLegacy: Contact = {
  name: 'Sarah Mitchell',
  role: 'Accounts Payable Manager',
  email: 's.mitchell@northgatemedical.com',
  phone: '+1 (555) 847-2193',
  lastContact: 'Jun 22, 2026',
  responseRate: 60,
};

export const mockCommunicationHistory: CommunicationLog[] = [
  {
    id: 'COMM-001',
    type: 'invoice_delivery',
    title: 'Invoice Delivery',
    date: 'Jun 15, 2026',
    time: '9:00 AM',
    status: 'delivered',
    content:
      'Hi Sarah, please find attached invoice INV-2024-0847 for services rendered in May 2026. Payment is due by June 15.',
  },
  {
    id: 'COMM-002',
    type: 'email',
    title: 'Friendly Reminder',
    date: 'Jun 18, 2026',
    time: '9:14 AM',
    status: 'delivered',
    content:
      'Hi Sarah, just a friendly reminder that invoice INV-2024-0847 for $24,750.00 was due June 15. Please let us know if you need...',
  },
  {
    id: 'COMM-003',
    type: 'sms',
    title: 'SMS Reminder',
    date: 'Jun 22, 2026',
    time: '10:30 AM',
    status: 'sent',
    content:
      'Reminder: Invoice #0847 ($24,750) was due Jun 15. Pay securely at: [link] · Reply STOP to opt out.',
  },
];

export const mockNextAction: NextAction = {
  action: 'SMS Reminder',
  scheduledDate: 'Jun 22, 2026',
  scheduledTime: '10:30 AM',
  workflow: 'Auto-Collection v2',
  priority: 'high',
};

export const mockReminderPreview: ReminderPreview = {
  from: 'AR Team <collections@yourcompany.com>',
  to: 's.mitchell@northgatemedical.com',
  subject: 'Payment Reminder — INV-2024-0847 · $24,750.00 Overdue',
  body: `Hi Sarah,

I hope this message finds you well. I'm reaching out regarding invoice INV-2024-0847 for $24,750.00, which was due on June 15, 2026 and is currently 22 days past due.

We understand that oversights happen, and we would love to work with you to resolve this promptly. Could you let us know the expected payment date, or if there is any issue with the invoice that we can help address?

You can pay securely online at any time using the link below, or contact our accounts receivable team directly at (800) 555-0192.

Pay Invoice — $24,750.00
Secure payment · INV-2024-0847

Thank you for your attention to this matter. We value our partnership with Northgate Medical Group and look forward to resolving this quickly.

Warm regards,
Accounts Receivable Team
YourCompany · collections@yourcompany.com`,
  generatedAt: 'Jun 22, 2026 at 10:15 AM',
  status: 'pending_approval',
};

export const mockAIInsight: AIInsight = {
  summary:
    'Client typically responds within 48 hours of phone contact. Consider scheduling a call on Jun 24 for optimal response probability.',
  recommendedAction: 'Schedule phone call',
  optimalContactTime: 'Jun 24, 2026',
};

async function getJsonWithFallback<T>(
  path: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return fallback;
    }

    const data: unknown = await response.json();
    return validate(data) ? data : fallback;
  } catch {
    return fallback;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isInvoiceDetail(value: unknown): value is InvoiceDetail {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.client === 'string' &&
    typeof value.amountDue === 'number' &&
    typeof value.dueDate === 'string' &&
    typeof value.daysOverdue === 'number' &&
    typeof value.status === 'string' &&
    typeof value.riskLevel === 'string' &&
    typeof value.strategy === 'string' &&
    isObject(value.collectionProgress)
  );
}

function isCollectionStepArray(value: unknown): value is CollectionStep[] {
  return Array.isArray(value) && value.every((step) => isObject(step));
}

function isContact(value: unknown): value is Contact {
  return (
    isObject(value) &&
    typeof value.name === 'string' &&
    typeof value.role === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.lastContact === 'string' &&
    typeof value.responseRate === 'number'
  );
}

function isCommunicationLogArray(value: unknown): value is CommunicationLog[] {
  return Array.isArray(value) && value.every((entry) => isObject(entry));
}

function isReminderPreview(value: unknown): value is ReminderPreview {
  return (
    isObject(value) &&
    typeof value.from === 'string' &&
    typeof value.to === 'string' &&
    typeof value.subject === 'string' &&
    typeof value.body === 'string' &&
    typeof value.generatedAt === 'string' &&
    typeof value.status === 'string'
  );
}

export async function fetchInvoiceDetail(id: string): Promise<InvoiceDetail> {
  const fallback = invoiceForId(id);
  return getJsonWithFallback(`/invoices/${id}/detail`, fallback, isInvoiceDetail);
}

export async function fetchCollectionTimeline(id: string): Promise<CollectionStep[]> {
  const invoice = invoiceForId(id);
  return getJsonWithFallback(
    `/invoices/${id}/timeline`,
    timelineForInvoice(invoice),
    isCollectionStepArray,
  );
}

export async function fetchPrimaryContact(id: string): Promise<Contact> {
  return getJsonWithFallback(`/invoices/${id}/contact`, contactForInvoice(id), isContact);
}

export async function fetchCommunicationHistory(id: string): Promise<CommunicationLog[]> {
  const invoice = invoiceForId(id);
  return getJsonWithFallback(
    `/invoices/${id}/communications`,
    communicationHistoryForInvoice(invoice),
    isCommunicationLogArray,
  );
}

export async function fetchReminderPreview(id: string): Promise<ReminderPreview> {
  const fallback = reminderForInvoice(invoiceForId(id));

  return getJsonWithFallback(`/invoices/${id}/reminder`, fallback, isReminderPreview);
}

export async function fetchNextAction(id: string): Promise<NextAction> {
  return nextActionForInvoice(invoiceForId(id));
}

export async function fetchAIInsight(id: string): Promise<AIInsight> {
  return insightForInvoice(invoiceForId(id));
}
