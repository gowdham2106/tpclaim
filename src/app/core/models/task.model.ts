export interface TaskItem {
  id: string;
  claimRef: string;
  title: string;
  assignedUser: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  description: string;
  category: 'Document Follow-up' | 'Investigation Visit' | 'Legal Notice' | 'Assessment Review' | 'Settlement Mandate';
}

export interface NotificationItem {
  id: string;
  claimRef: string;
  title: string;
  message: string;
  category: 'Intimation' | 'Document' | 'Investigation' | 'Legal' | 'Approval' | 'Settlement' | 'Task';
  timestamp: string;
  isRead: boolean;
  priority: 'High' | 'Normal';
  actionRoute?: string;
}

export interface CommunicationLog {
  id: string;
  claimRef: string;
  date: string;
  time: string;
  type: 'Outbound Call' | 'Inbound Call' | 'Email' | 'SMS' | 'Legal Notice' | 'System Notification';
  participants: string;
  summary: string;
  status: 'Delivered' | 'Connected' | 'Pending Callback' | 'Failed';
  loggedBy: string;
}
