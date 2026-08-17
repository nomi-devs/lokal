// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
export type Notification = {
  id: number;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Alert" | "System";
  priority: "Normal" | "High" | "Critical";
  sentAt: string;
  read: boolean;
};

export const notifications: Notification[] = [
  {
    id: 1,
    title: "Welcome to LOKAL",
    message: "Your account has been set up successfully.",
    type: "System",
    priority: "Normal",
    sentAt: "2024-01-15 09:00",
    read: true,
  },
  {
    id: 2,
    title: "Security alert: new login",
    message: "A new login was detected from an unknown device.",
    type: "Alert",
    priority: "High",
    sentAt: "2024-01-16 14:22",
    read: false,
  },
  {
    id: 3,
    title: "Your plan renews in 3 days",
    message: "Please ensure your payment method is up to date.",
    type: "Warning",
    priority: "Normal",
    sentAt: "2024-01-17 08:00",
    read: false,
  },
  {
    id: 4,
    title: "System maintenance scheduled",
    message: "Scheduled downtime: Jan 20, 02:00–04:00 UTC.",
    type: "System",
    priority: "High",
    sentAt: "2024-01-18 10:00",
    read: true,
  },
  {
    id: 5,
    title: "New user registered",
    message: "John Doe just signed up for a free account.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-18 11:45",
    read: true,
  },
  {
    id: 6,
    title: "Critical: disk usage at 90%",
    message: "Storage is almost full. Please free up space.",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-19 06:30",
    read: false,
  },
  {
    id: 7,
    title: "Weekly report available",
    message: "Your analytics report for last week is ready.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-19 08:00",
    read: true,
  },
  {
    id: 8,
    title: "Password changed successfully",
    message: "Your account password was updated.",
    type: "System",
    priority: "Normal",
    sentAt: "2024-01-19 15:10",
    read: true,
  },
  {
    id: 9,
    title: "Failed payment attempt",
    message: "Payment of $49.00 failed. Update billing details.",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-20 09:00",
    read: false,
  },
  {
    id: 10,
    title: "Feature update: DataTable v2",
    message: "New filtering and sorting features are now live.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-20 12:00",
    read: true,
  },
];

export type SentNotification = {
  id: number;
  title: string;
  recipients: string;
  type: string;
  priority: string;
  sentAt: string;
  delivered: number;
};

export const sentHistory: SentNotification[] = [
  {
    id: 1,
    title: "System maintenance scheduled",
    recipients: "All Users",
    type: "System",
    priority: "High",
    sentAt: "2024-01-18 10:00",
    delivered: 1284,
  },
  {
    id: 2,
    title: "New feature: dark mode",
    recipients: "All Users",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-17 09:00",
    delivered: 1284,
  },
  {
    id: 3,
    title: "Admin security briefing",
    recipients: "Admins",
    type: "Alert",
    priority: "High",
    sentAt: "2024-01-16 15:00",
    delivered: 12,
  },
  {
    id: 4,
    title: "Trial expiring soon",
    recipients: "Users",
    type: "Warning",
    priority: "Normal",
    sentAt: "2024-01-15 08:00",
    delivered: 843,
  },
  {
    id: 5,
    title: "Critical: storage alert",
    recipients: "Admins",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-14 06:00",
    delivered: 12,
  },
];
