// Enums
export type InvoiceStatus = 'Overdue' | 'In Progress' | 'Escalated' | 'Critical' | 'Paid' | 'Pending';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type CollectionStepStatus = 'completed' | 'active' | 'pending';
export type CommunicationType = 'email' | 'sms' | 'phone' | 'invoice_delivery';
export type CommunicationStatus = 'delivered' | 'sent' | 'failed' | 'pending';

// Invoice Detail
export interface InvoiceDetail {
  id: string;
  client: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  status: InvoiceStatus;
  riskLevel: RiskLevel;
  strategy: string;
  collectionProgress: {
    currentStep: number;
    totalSteps: number;
    percentComplete: number;
    currentStage: string;
    initiatedLabel?: string;
  };
}

// Collection Step
export interface CollectionStep {
  day: number;
  title: string;
  description: string;
  date: string;
  status: CollectionStepStatus;
  icon: 'check' | 'message' | 'alert' | 'clock' | 'phone';
}

// Contact
export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  lastContact: string;
  responseRate: number;
}

// Communication Log
export interface CommunicationLog {
  id: string;
  type: CommunicationType;
  title: string;
  date: string;
  time: string;
  status: CommunicationStatus;
  content: string;
}

// Reminder Preview
export interface ReminderPreview {
  from: string;
  to: string;
  subject: string;
  body: string;
  generatedAt: string;
  status: 'generated' | 'pending_approval' | 'sent';
}

// Next Action
export interface NextAction {
  action: string;
  scheduledDate: string;
  scheduledTime: string;
  workflow: string;
  priority: 'low' | 'medium' | 'high';
}

// AI Insight
export interface AIInsight {
  summary: string;
  recommendedAction: string;
  optimalContactTime?: string;
}
