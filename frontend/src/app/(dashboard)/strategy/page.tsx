import StrategyTimeline from '../../../components/strategy/StrategyTimeline';
import { CollectionStep } from '@/types/invoice';

const mockSteps: CollectionStep[] = [
  { day: 1, title: 'Invoice Sent', description: 'Initial invoice delivered to client via email.', date: 'Jun 15, 2026', status: 'completed', icon: 'check' },
  { day: 7, title: 'Friendly Reminder', description: 'Automated polite reminder sent.', date: 'Jun 22, 2026', status: 'completed', icon: 'message' },
  { day: 14, title: 'Follow-up Call', description: 'Phone call placed to accounts payable.', date: 'Jun 29, 2026', status: 'active', icon: 'phone' },
  { day: 30, title: 'Escalation Notice', description: 'Formal escalation email sent.', date: 'Jul 15, 2026', status: 'pending', icon: 'alert' },
  { day: 45, title: 'Collections Referral', description: 'Referred to external collections agency.', date: 'Jul 30, 2026', status: 'pending', icon: 'clock' },
];

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <StrategyTimeline steps={mockSteps} />
    </div>
  );
}
