export type Section = 'home' | 'apply-loan' | 'my-loans' | 'digital-services' | 'trust' | 'account' | 'developer' | 'transactions' | 'settings' | 'help' | 'agent' | 'ai-lab';
export type Role = 'user' | 'admin' | 'developer' | 'agent';

export interface User {
  id: string;
  name: string;
  phone: string;
  nrc: string;
  password?: string;
  isRegistered: boolean;
  nrcFront?: string;
  nrcBack?: string;
  selfiePhoto?: string;
  passportPhoto?: string;
  balance: number;
  isVerified: boolean;
  isFrozen?: boolean;
  adminId?: string; // For data isolation
  createdAt?: string;
  location?: {
    lat: number;
    lng: number;
    timestamp: string;
    address?: string;
  };
  paymentMethods?: {
    type: 'mobile_money';
    number: string;
    provider: string;
  }[];
}

export interface Admin {
  id: string;
  username: string;
  password?: string;
  companyName: string;
  isApproved: boolean;
  invitedBy?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  isMainAdmin?: boolean;
  isStaffAdmin?: boolean; // New field
  approvedAppName?: string;
}

export interface AppRequest {
  id: string;
  adminId: string;
  requestedName: string;
  appIcon?: string; // New field for image upload
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string; // Admin name
  desiredUsername?: string;
  desiredPassword?: string;
  downloadUrl?: string;
}

export interface Agent {
  id: string;
  adminId: string;
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  taxId?: string;
  joinedAt: string;
  password?: string;
}

export interface Meeting {
  id: string;
  hostId: string; // Developer ID
  title: string;
  startTime: string;
  status: 'planned' | 'live' | 'ended';
  streamUrl?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface StreamingApp {
  id: string;
  name: string;
  url: string;
  category: 'admin' | 'developer';
  status: 'online' | 'offline';
}

export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'loan' | 'system' | 'chat';
}

export interface LoanRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: string;
  tenure?: string; // e.g., "6 months"
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface LoanType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'loan' | 'payment' | 'investment' | 'bill' | 'deposit' | 'withdrawal';
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  creditScore: number;
}

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  remainingBalance: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Defaulted';
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export interface AIServer {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'maintenance';
  model: string;
  type: 'text' | 'image' | 'audio';
}

export interface RecurringPayment {
  id: string;
  userId: string;
  serviceName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface AgentRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminId?: string; // If they applied under a specific admin
}

export interface AIPublishRequest {
  id: string;
  requesterId: string;
  requesterRole: Role;
  content: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  publishedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface SystemConfig {
  appName: string;
  appLogo: string;
  dmiLogo?: string;
  aiPrompt: string;
  primaryColor: string;
  maintenanceMode: boolean;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  memoryEnabled?: boolean;
  version?: string;
  downloadUrl?: string; // For Admins to download the "published" app
}
