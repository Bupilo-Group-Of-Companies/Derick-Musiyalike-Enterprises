import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Shield, 
  Lock, 
  ArrowRight,
  Trash2,
  Search,
  Download,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Copy,
  Database,
  MessageSquare,
  Eye,
  FileDown,
  Settings,
  Save,
  Zap,
  MapPin,
  TrendingUp,
  Wallet,
  Video,
  Play,
  Plus,
  UserPlus,
  Briefcase,
  Globe,
  Smartphone,
  Check,
  X,
  Filter
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { User, LoanRequest, ChatMessage, Agent, Meeting, StreamingApp, AppRequest, Admin, Transaction } from '../types';

import SupportChat from './SupportChat';
import LiveMeeting from './LiveMeeting';

interface AdminPanelProps {
  onLogout: () => void;
  isDeveloper?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, isDeveloper }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isDeveloper || false);
  const [adminUser, setAdminUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [streamingApps, setStreamingApps] = useState<StreamingApp[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'services' | 'system' | 'workplace' | 'storage' | 'chat' | 'agents' | 'meetings' | 'streaming' | 'app-request' | 'live-meeting' | 'transactions'>('workplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [recurringPayments, setRecurringPayments] = useState<any[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [requestedAppName, setRequestedAppName] = useState('');
  const [desiredUsername, setDesiredUsername] = useState('');
  const [desiredPassword, setDesiredPassword] = useState('');
  const [myAppRequests, setMyAppRequests] = useState<AppRequest[]>([]);
  const [files, setFiles] = useState<{ id: string, name: string, size: string, type: string, date: string, content?: string }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txDateRange, setTxDateRange] = useState<string>('all');
  const [config, setConfig] = useState<any>({
    appName: 'MoneyLink Financial',
    appLogo: logo,
    maintenanceMode: false,
    twoFactorEnabled: true,
    biometricEnabled: true
  });

  const exportToJson = () => {
    const data = {
      users,
      loanRequests,
      exportDate: new Date().toISOString(),
      system: `${config.appName} Banking System`
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneylink_data_export_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToSvg = () => {
    const totalDisbursed = loanRequests.filter(r => r.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingLoans = loanRequests.filter(r => r.status === 'pending').length;
    
    const svgContent = `
      <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" rx="40" fill="#F8F9FA"/>
        <rect x="40" y="40" width="520" height="320" rx="30" fill="white" stroke="#E5E5E5" stroke-width="2"/>
        
        <text x="70" y="90" fill="#1A1A1A" font-family="Arial" font-size="24" font-weight="bold">{config.appName} System Report</text>
        <text x="70" y="120" fill="#666" font-family="Arial" font-size="14">Generated on: ${new Date().toLocaleDateString()}</text>
        
        <rect x="70" y="160" width="140" height="80" rx="20" fill="#F0FDF4"/>
        <text x="85" y="185" fill="#15803D" font-family="Arial" font-size="10" font-weight="bold">TOTAL USERS</text>
        <text x="85" y="220" fill="#14532D" font-family="Arial" font-size="24" font-weight="black">${users.length}</text>
        
        <rect x="230" y="160" width="140" height="80" rx="20" fill="#EFF6FF"/>
        <text x="245" y="185" fill="#1D4ED8" font-family="Arial" font-size="10" font-weight="bold">PENDING LOANS</text>
        <text x="245" y="220" fill="#1E3A8A" font-family="Arial" font-size="24" font-weight="black">${pendingLoans}</text>
        
        <rect x="390" y="160" width="140" height="80" rx="20" fill="#FFFBEB"/>
        <text x="405" y="185" fill="#B45309" font-family="Arial" font-size="10" font-weight="bold">DISBURSED (K)</text>
        <text x="405" y="220" fill="#78350F" font-family="Arial" font-size="20" font-weight="black">${(totalDisbursed || 0).toLocaleString()}</text>
        
        <path d="M70 300 L530 300" stroke="#F0F0F0" stroke-width="2"/>
        <text x="70" y="335" fill="#999" font-family="Arial" font-size="12">© 2026 {config.appName} Banking System - Secure & Regulated</text>
      </svg>
    `;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneylink_report_${new Date().getTime()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('MoneyLink System Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = users.map(u => [u.name, u.phone, u.nrc, `K ${u.balance || 0}`]);
    (doc as any).autoTable({
      head: [['Name', 'Phone', 'NRC', 'Balance']],
      body: tableData,
      startY: 40,
    });

    doc.save(`moneylink_report_${new Date().getTime()}.pdf`);
  };

  const [isConnectionActive, setIsConnectionActive] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPartner = params.get('mode') === 'dmi';
    
    const directLogin = localStorage.getItem('moneylink_admin_direct_login');
    if (directLogin === 'true') {
      setIsLoggedIn(true);
      localStorage.removeItem('moneylink_admin_direct_login'); // Use once
    }
    
    const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
    const defaultConfig = {
      appName: isPartner ? 'DERICK MUSIYALIKE INSTITUTION (DMI)' : 'MoneyLink Financial',
      appLogo: isPartner 
        ? 'https://ui-avatars.com/api/?name=D+M+I&background=1e3a8a&color=fff&size=200&font-size=0.5&length=3&bold=true'
        : logo,
      maintenanceMode: false,
      twoFactorEnabled: true,
      biometricEnabled: true
    };
    
    if (isPartner) {
      setConfig(defaultConfig);
    } else if (storedConfig.appName) {
      setConfig((prev: any) => ({ ...prev, ...storedConfig }));
    }
    
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          // Fetch from backend with adminId filter
          const adminIdParam = currentAdminId ? `?adminId=${currentAdminId}` : '';
          
          const fetchWithFallback = async (url: string, fallback: any = []) => {
            try {
              const res = await fetch(url);
              if (!res.ok) return fallback;
              return await res.json();
            } catch (e) {
              console.warn(`Failed to fetch ${url}:`, e);
              return fallback;
            }
          };

          const [
            backendUsers, backendAgents, backendMeetings, backendStreaming, 
            allRequests, backendConfig, backendTransactions, backendLoanRequests,
            backendChatMessages, backendAdminNotifications, backendRecurringPayments
          ] = await Promise.all([
            fetchWithFallback(`/api/users${adminIdParam}`),
            fetchWithFallback(`/api/agents${adminIdParam}`),
            fetchWithFallback('/api/meetings'),
            fetchWithFallback('/api/streaming-apps?category=admin'),
            fetchWithFallback('/api/app-requests'),
            fetchWithFallback('/api/system-config', {}),
            fetchWithFallback('/api/transactions'),
            fetchWithFallback(`/api/loan-requests${adminIdParam}`),
            fetchWithFallback(`/api/chat-messages${adminIdParam}`),
            fetchWithFallback('/api/admin-notifications'),
            fetchWithFallback('/api/recurring-payments')
          ]);
          
          setUsers(backendUsers);
          setAgents(backendAgents);
          setMeetings(backendMeetings);
          setStreamingApps(backendStreaming);
          setMyAppRequests(allRequests.filter((r: any) => r.adminId === currentAdminId));
          setTransactions(backendTransactions);
          setLoanRequests(backendLoanRequests);
          setChatMessages(backendChatMessages);
          setAdminNotifications(backendAdminNotifications);
          setRecurringPayments(backendRecurringPayments);
          
          if (backendConfig && Object.keys(backendConfig).length > 0) {
            setConfig(prev => ({ ...prev, ...backendConfig }));
          }

          const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
          if (Object.keys(storedConfig).length > 0) setConfig(storedConfig);
          
          setIsConnectionActive(true);
          setTimeout(() => setIsConnectionActive(false), 1000); // Visual pulse
        } catch (error) {
          console.error('Failed to load data from backend:', error);
        }
      };

      loadData();
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentAdminId]);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setCurrentAdminId(data.admin.id);
        setCurrentAdmin(data.admin);
        setError('');
      } else {
        setError(data.message || 'Invalid Admin Credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  const submitAppRequest = async () => {
    if (!requestedAppName.trim() || !desiredUsername.trim() || !desiredPassword.trim()) {
      alert('Please fill in all fields (App Name, Username, Password)');
      return;
    }
    
    const newRequest: AppRequest = {
      id: Date.now().toString(),
      adminId: currentAdminId || 'unknown',
      requestedName: requestedAppName,
      status: 'pending',
      createdBy: adminUser,
      createdAt: new Date().toISOString(),
      desiredUsername: desiredUsername,
      desiredPassword: desiredPassword
    };
    
    await fetch('/api/app-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    });
    
    setMyAppRequests(prev => [newRequest, ...prev]);
    setRequestedAppName('');
    setDesiredUsername('');
    setDesiredPassword('');
    alert('App Name Request submitted to Developer for approval!');
  };

  const recruitAgent = async () => {
    const name = prompt('Enter Agent Name:');
    if (!name) return;
    
    const newAgent: Agent = {
      id: Date.now().toString(),
      adminId: currentAdminId || 'unknown',
      name,
      status: 'active',
      taxId: `TAX_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      joinedAt: new Date().toISOString()
    };
    
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent)
    });
    
    setAgents(prev => [newAgent, ...prev]);
    alert('Agent recruited successfully!');
  };

  const addUser = async () => {
    const name = prompt('Enter User Name:');
    if (!name) return;
    const phone = prompt('Enter Phone:');
    if (!phone) return;
    
    const newUser: User = {
      id: Date.now().toString(),
      adminId: currentAdminId || 'unknown',
      name,
      phone,
      nrc: 'PENDING',
      isRegistered: false,
      balance: 0,
      isVerified: false,
      isFrozen: false,
      createdAt: new Date().toISOString()
    };
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    setUsers(prev => [newUser, ...prev]);
    alert('User added successfully!');
  };

  const saveConfig = () => {
    localStorage.setItem('moneylink_config', JSON.stringify(config));
    alert('System Configuration Updated!');
  };

  const deleteRecurring = async (id: string) => {
    if (confirm('Cancel this recurring payment?')) {
      try {
        await fetch(`/api/recurring-payments/${id}`, { method: 'DELETE' });
        setRecurringPayments(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete recurring payment via API', error);
        const updated = recurringPayments.filter(p => p.id !== id);
        setRecurringPayments(updated);
        localStorage.setItem('moneylink_recurring_payments', JSON.stringify(updated));
      }
    }
  };

  const markNotificationsAsRead = async (type?: string) => {
    try {
      const updated = adminNotifications.map(n => {
        if (!type || n.type === type || n.userId) return { ...n, isRead: true };
        return n;
      });
      
      // Update each notification via API
      await Promise.all(updated.filter(n => n.isRead).map(n => 
        fetch(`/api/admin-notifications/${n.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n)
        })
      ));
      
      setAdminNotifications(updated);
    } catch (error) {
      console.error('Failed to mark notifications as read via API', error);
      const updated = adminNotifications.map(n => {
        if (!type || n.type === type || n.userId) return { ...n, isRead: true };
        return n;
      });
      setAdminNotifications(updated);
      localStorage.setItem('moneylink_admin_notifications', JSON.stringify(updated));
    }
  };

  const downloadAllUsersPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('MoneyLink Master User Database', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Users: ${users.length}`, 14, 35);
    
    doc.line(14, 40, 196, 40);

    const tableData = users.map(u => [
      u.name, 
      `+260 ${u.phone}`, 
      u.nrc, 
      `K ${u.balance || 0}`,
      u.isVerified ? 'VERIFIED' : 'PENDING',
      u.isFrozen ? 'FROZEN' : 'ACTIVE'
    ]);

    (doc as any).autoTable({
      head: [['Name', 'Phone', 'NRC', 'Balance', 'Status', 'Account']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 128, 61] }
    });

    // Add detailed pages for each user
    users.forEach((user, index) => {
      doc.addPage();
      doc.setFontSize(18);
      doc.text(`User Profile: ${user.name}`, 14, 22);
      doc.line(14, 25, 196, 25);
      
      doc.setFontSize(10);
      let y = 35;
      doc.text(`System ID: ${user.id}`, 14, y); y += 7;
      doc.text(`Full Name: ${user.name}`, 14, y); y += 7;
      doc.text(`Phone Number: +260 ${user.phone}`, 14, y); y += 7;
      doc.text(`NRC Number: ${user.nrc}`, 14, y); y += 7;
      doc.text(`Current Balance: K ${user.balance || 0}`, 14, y); y += 7;
      doc.text(`Verification Status: ${user.isVerified ? 'VERIFIED' : 'PENDING'}`, 14, y); y += 7;
      doc.text(`Account Status: ${user.isFrozen ? 'FROZEN' : 'ACTIVE'}`, 14, y); y += 10;
      
      doc.setFontSize(12);
      doc.text('Uploaded Documents Metadata:', 14, y); y += 7;
      doc.setFontSize(9);
      doc.text(`- NRC Front: ${user.nrcFront ? 'UPLOADED (Base64 Data Present)' : 'NOT UPLOADED'}`, 14, y); y += 5;
      doc.text(`- NRC Back: ${user.nrcBack ? 'UPLOADED (Base64 Data Present)' : 'NOT UPLOADED'}`, 14, y); y += 5;
      doc.text(`- Selfie Photo: ${user.selfiePhoto ? 'UPLOADED (Base64 Data Present)' : 'NOT UPLOADED'}`, 14, y); y += 5;
      doc.text(`- Passport Photo: ${user.passportPhoto ? 'UPLOADED (Base64 Data Present)' : 'NOT UPLOADED'}`, 14, y); y += 10;
      
      doc.setFontSize(8);
      doc.text('Note: High-resolution images are stored in the secure cloud storage and can be viewed in the Admin Panel.', 14, y);
    });

    doc.save(`moneylink_master_database_${new Date().getTime()}.pdf`);
    alert('Master User Database PDF generated successfully!');
  };

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('moneylink_admin_files') || '[]');
    setFiles(storedFiles);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type,
        date: new Date().toLocaleDateString(),
        content: event.target?.result as string
      };
      const updatedFiles = [newFile, ...files];
      setFiles(updatedFiles);
      localStorage.setItem('moneylink_admin_files', JSON.stringify(updatedFiles));
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem('moneylink_admin_files', JSON.stringify(updatedFiles));
  };

  const downloadFile = (file: any) => {
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    a.click();
  };

  const downloadDossier = (user: User) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('MoneyLink User Dossier', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(14);
    doc.text('Personal Information', 14, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${user.name}`, 14, 55);
    doc.text(`Phone: +260 ${user.phone}`, 14, 62);
    doc.text(`NRC Number: ${user.nrc}`, 14, 69);
    doc.text(`Current Balance: K ${user.balance || 0}`, 14, 76);
    doc.text(`Verification Status: ${user.isVerified ? 'VERIFIED' : 'PENDING'}`, 14, 83);
    
    doc.text('System ID: ' + user.id, 14, 95);
    
    // Note: Images in PDF are complex with base64, but we can add placeholders or try to embed if they are base64
    doc.text('Documents on File:', 14, 110);
    doc.text('- NRC Front Copy: [ATTACHED IN SYSTEM]', 14, 117);
    doc.text('- NRC Back Copy: [ATTACHED IN SYSTEM]', 14, 124);
    doc.text('- Selfie Verification: [ATTACHED IN SYSTEM]', 14, 131);
    doc.text('- Passport Photo: [ATTACHED IN SYSTEM]', 14, 138);
    
    doc.setFontSize(8);
    doc.text(`${config.appName} Banking System - Confidential Document`, 14, 280);
    
    doc.save(`${config.appName.toLowerCase().replace(/\s+/g, '_')}_dossier_${user.name.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadLoanApproval = (request: LoanRequest) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Loan Approval Certificate', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(14);
    doc.text('Loan Details', 14, 45);
    doc.setFontSize(10);
    doc.text(`Borrower: ${request.userName}`, 14, 55);
    doc.text(`Loan Type: ${request.type}`, 14, 62);
    doc.text(`Amount Approved: K ${request.amount}`, 14, 69);
    doc.text(`Request ID: ${request.id}`, 14, 76);
    doc.text(`Status: APPROVED`, 14, 83);
    
    doc.rect(14, 95, 182, 40);
    doc.text('Terms and Conditions:', 18, 105);
    doc.text('1. This loan is subject to the agreed interest rates.', 18, 112);
    doc.text('2. Repayment must be made within the specified period.', 18, 119);
    doc.text('3. Late payments may incur additional charges.', 18, 126);
    
    doc.text('Authorized Signature: _______________________', 14, 160);
    doc.text(`${config.appName} Administration`, 14, 167);
    
    doc.save(`${config.appName.toLowerCase().replace(/\s+/g, '_')}_loan_approval_${request.id}.pdf`);
  };

  const handleApprove = async (requestId: string) => {
    const request = loanRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update Request Status via API
      const updatedRequest = { ...request, status: 'approved' as const };
      await fetch(`/api/loan-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      });

      const updatedRequests = loanRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      setLoanRequests(updatedRequests);

      // Update User Balance via API
      const userToUpdate = users.find(u => u.id === request.userId);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, balance: (userToUpdate.balance || 0) + request.amount };
        await fetch(`/api/users/${request.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
        
        setUsers(users.map(u => u.id === request.userId ? updatedUser : u));
        
        // Update current user if they are the one logged in
        const currentUser = JSON.parse(localStorage.getItem('moneylink_current_user') || 'null');
        if (currentUser && currentUser.id === request.userId) {
          localStorage.setItem('moneylink_current_user', JSON.stringify(updatedUser));
        }
      }

      // Send Notification via API
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.userId,
          title: 'Loan Approved',
          message: `Your loan of K ${request.amount} has been approved and added to your balance.`,
          isRead: false,
          type: 'loan'
        })
      });
      
      // Trigger PDF Download
      downloadLoanApproval(request);
      
      alert(`Loan of K ${request.amount} approved for ${request.userName}. Approval PDF downloaded.`);
    } catch (error) {
      console.error('Failed to approve loan via API, falling back to local storage', error);
      // Fallback to local storage
      const updatedRequests = loanRequests.map(req => 
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      );
      setLoanRequests(updatedRequests);
      localStorage.setItem('moneylink_loan_requests', JSON.stringify(updatedRequests));

      // Update User Balance
      const storedUsers: User[] = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
      const updatedUsers = storedUsers.map(u => {
        if (u.id === request.userId) {
          return { ...u, balance: (u.balance || 0) + request.amount };
        }
        return u;
      });
      setUsers(updatedUsers);
      localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));

      // Update current user if they are the one logged in
      const currentUser = JSON.parse(localStorage.getItem('moneylink_current_user') || 'null');
      if (currentUser && currentUser.id === request.userId) {
        const updatedCurrentUser = { ...currentUser, balance: (currentUser.balance || 0) + request.amount };
        localStorage.setItem('moneylink_current_user', JSON.stringify(updatedCurrentUser));
      }

      // Send Notification
      const notifications = JSON.parse(localStorage.getItem('moneylink_notifications') || '[]');
      notifications.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: request.userId,
        title: 'Loan Approved',
        message: `Your loan of K ${request.amount} has been approved and added to your balance.`,
        date: new Date().toLocaleString(),
        isRead: false,
        type: 'loan'
      });
      localStorage.setItem('moneylink_notifications', JSON.stringify(notifications));
      
      // Trigger PDF Download
      downloadLoanApproval(request);
      
      alert(`Loan of K ${request.amount} approved for ${request.userName}. Approval PDF downloaded.`);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserForChat || !newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'admin',
      receiverId: selectedUserForChat.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: true
    };

    try {
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      
      const updatedMessages = [...chatMessages, msg];
      setChatMessages(updatedMessages);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message via API, falling back to local storage', error);
      const updatedMessages = [...chatMessages, msg];
      setChatMessages(updatedMessages);
      localStorage.setItem('moneylink_chats', JSON.stringify(updatedMessages));
      setNewMessage('');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const request = loanRequests.find(r => r.id === requestId);
      if (!request) return;
      
      const updatedRequest = { ...request, status: 'rejected' as const };
      await fetch(`/api/loan-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      });
      
      const updatedRequests = loanRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      setLoanRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to reject loan via API, falling back to local storage', error);
      const updatedRequests = loanRequests.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' as const } : req
      );
      setLoanRequests(updatedRequests);
      localStorage.setItem('moneylink_loan_requests', JSON.stringify(updatedRequests));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
      
      // Update current user if they are the one being edited
      const currentUser = JSON.parse(localStorage.getItem('moneylink_current_user') || 'null');
      if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem('moneylink_current_user', JSON.stringify(updatedUser));
      }
      
      setEditingUser(null);
      alert('User profile updated successfully on backend!');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user on backend.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-[#E5E5E5]"
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto border-4 border-green-100 shadow-xl overflow-hidden">
              <img 
                src={config.appLogo} 
                alt="App Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logo;
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Admin Portal</h2>
              <p className="text-[#666] text-sm mt-2">Enter the admin credentials to access the dashboard.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                  <Users className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold focus:outline-none focus:border-green-700 transition-colors"
                  placeholder="Admin Username"
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold focus:outline-none focus:border-green-700 transition-colors"
                  placeholder="Admin Password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onLogout}
              className="text-sm text-[#999] font-bold hover:text-green-700 transition-colors"
            >
              Back to App
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {currentAdmin?.isMainAdmin ? 'DERICK MUSIYALIKE INSTITUTION' : currentAdmin?.companyName || 'Admin Dashboard'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnectionActive ? 'bg-green-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Digital Connection Active</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="p-3 bg-white border border-[#E5E5E5] text-[#666] rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </button>
        </div>

        <div className="flex flex-wrap gap-4 p-1 bg-[#F0F0F0] rounded-2xl w-full max-w-4xl">
          <button
            onClick={() => {
              setActiveTab('requests');
              markNotificationsAsRead('loan');
            }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'requests' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Requests
            {loanRequests.some(r => r.status === 'pending') && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'services' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Zap className="w-4 h-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chat' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'storage' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Database className="w-4 h-4" />
            Storage
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'system' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Settings className="w-4 h-4" />
            System
          </button>
          <button
            onClick={() => setActiveTab('workplace')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'workplace' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Shield className="w-4 h-4" />
            Workplace
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'agents' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <UserPlus className="w-4 h-4" />
            Agents
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'meetings' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Video className="w-4 h-4" />
            Meetings
            {meetings.some(m => m.status === 'live') && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('streaming')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'streaming' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Play className="w-4 h-4" />
            Streaming
          </button>
          <button
            onClick={() => setActiveTab('app-request')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'app-request' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Globe className="w-4 h-4" />
            App Request
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'transactions' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
            }`}>
            <Wallet className="w-4 h-4" />
            Transactions
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-[#E5E5E5] shadow-sm overflow-hidden">
          {activeTab !== 'workplace' && (
            <div className="p-6 border-b border-[#F0F0F0] flex items-center gap-4">
              <Search className="w-5 h-5 text-[#999]" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              />
              {activeTab === 'users' && (
                <div className="flex gap-2">
                  <button 
                    onClick={addUser}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    ADD_USER
                  </button>
                  <button 
                    onClick={downloadAllUsersPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-[10px] font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20"
                  >
                    <FileDown className="w-4 h-4" />
                    DOWNLOAD_MASTER_PDF
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {activeTab === 'agents' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Agent Management</h2>
                  <button onClick={recruitAgent} className="px-4 py-2 bg-green-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    RECRUIT_AGENT
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="p-6 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{agent.name}</p>
                        <p className="text-[10px] text-[#999]">Tax ID: {agent.taxId}</p>
                        <p className="text-[10px] text-green-700 font-bold mt-1">STATUS: {agent.status.toUpperCase()}</p>
                      </div>
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'meetings' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4">
                  <Video className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-bold">Live Meetings</h2>
                </div>
                <div className="space-y-4">
                  {meetings.filter(m => m.status === 'live').map(meeting => (
                    <div key={meeting.id} className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{meeting.title}</p>
                        <p className="text-[10px] text-[#999]">Host: {meeting.hostId}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-red-600 uppercase">LIVE NOW</span>
                        </div>
                        {meeting.socialLinks && meeting.socialLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {meeting.socialLinks.map((link, idx) => (
                              <a 
                                key={idx} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-white border border-[#E5E5E5] rounded-lg text-[8px] font-bold text-[#666] hover:border-blue-500 hover:text-blue-600 transition-all"
                              >
                                {link.platform.toUpperCase()}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <a href={meeting.streamUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold">JOIN_MEETING</a>
                    </div>
                  ))}
                  {meetings.filter(m => m.status === 'live').length === 0 && (
                    <div className="text-center py-12 text-[#999]">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">No live meetings at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'streaming' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Streaming Apps & Systems</h2>
                  <span className="text-[10px] font-bold text-green-700">{streamingApps.length} APPS AVAILABLE</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streamingApps.map((app) => (
                    <a 
                      key={app.id} 
                      href={app.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-video bg-[#F8F9FA] border border-[#E5E5E5] rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-green-700 transition-all cursor-pointer group p-6 text-center"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8 text-green-700" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{app.name}</p>
                        <span className={`text-[10px] font-bold uppercase ${app.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                          {app.status}
                        </span>
                      </div>
                    </a>
                  ))}
                  {streamingApps.length === 0 && (
                    <div className="col-span-full text-center py-12 text-[#999]">
                      <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">No streaming apps found.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'app-request' ? (
              <div className="max-w-md mx-auto space-y-8 py-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold">Request New App Name</h2>
                  <p className="text-sm text-[#666]">Admins can request a custom app name. Once approved by the developer, your workplace will be updated.</p>
                </div>
                
                {myAppRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#999] uppercase tracking-widest">Your Requests</h3>
                    {myAppRequests.map(req => (
                      <div key={req.id} className="p-4 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{req.requestedName}</p>
                          <p className="text-[10px] text-[#999]">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase ${
                          req.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Enter Requested App Name (Company Name)" 
                    value={requestedAppName}
                    onChange={(e) => setRequestedAppName(e.target.value)}
                    className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold outline-none focus:border-blue-600"
                  />
                  <input 
                    type="text" 
                    placeholder="Create Your Admin Username" 
                    value={desiredUsername}
                    onChange={(e) => setDesiredUsername(e.target.value)}
                    className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold outline-none focus:border-blue-600"
                  />
                  <input 
                    type="password" 
                    placeholder="Create Your Admin Password" 
                    value={desiredPassword}
                    onChange={(e) => setDesiredPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-lg font-bold outline-none focus:border-blue-600"
                  />
                  <button 
                    onClick={submitAppRequest}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    SUBMIT_REQUEST
                  </button>
                </div>
              </div>
            ) : activeTab === 'live-meeting' ? (
              <div className="h-[600px] relative">
                <LiveMeeting 
                  userId={currentAdminId || 'admin'}
                  userName={currentAdmin?.companyName || 'Admin'}
                  onLeave={() => setActiveTab('requests')}
                />
              </div>
            ) : activeTab === 'transactions' ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#F8F9FA] p-4 rounded-2xl border border-[#E5E5E5]">
                  <div className="flex items-center gap-2 text-[#666] font-bold text-sm">
                    <Filter className="w-4 h-4" />
                    Filters
                  </div>
                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <select 
                      value={txFilterType}
                      onChange={(e) => setTxFilterType(e.target.value)}
                      className="flex-1 md:flex-none bg-white border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-blue-600"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="loan">Loan</option>
                      <option value="payment">Payment</option>
                      <option value="investment">Investment</option>
                      <option value="bill">Bill</option>
                    </select>

                    <select 
                      value={txDateRange}
                      onChange={(e) => setTxDateRange(e.target.value)}
                      className="flex-1 md:flex-none bg-white border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-blue-600"
                    >
                      <option value="all">All Time</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="thisMonth">This Month</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8F9FA] text-[#999] text-[10px] uppercase font-bold tracking-widest">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F0]">
                      {transactions.filter(tx => {
                        if (txFilterType !== 'all' && tx.type !== txFilterType) return false;
                        if (txDateRange !== 'all') {
                          const txDate = new Date(tx.date);
                          const now = new Date();
                          if (txDateRange === 'last7days') {
                            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            if (txDate < sevenDaysAgo) return false;
                          } else if (txDateRange === 'last30days') {
                            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            if (txDate < thirtyDaysAgo) return false;
                          } else if (txDateRange === 'thisMonth') {
                            if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
                              return false;
                            }
                          }
                        }
                        return true;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#999] text-xs">No transactions found.</td>
                        </tr>
                      ) : (
                        transactions.filter(tx => {
                          if (txFilterType !== 'all' && tx.type !== txFilterType) return false;
                          if (txDateRange !== 'all') {
                            const txDate = new Date(tx.date);
                            const now = new Date();
                            if (txDateRange === 'last7days') {
                              const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                              if (txDate < sevenDaysAgo) return false;
                            } else if (txDateRange === 'last30days') {
                              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                              if (txDate < thirtyDaysAgo) return false;
                            } else if (txDateRange === 'thisMonth') {
                              if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
                                return false;
                              }
                            }
                          }
                          return true;
                        }).map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#F9F9F9] transition-colors">
                            <td className="px-6 py-4 text-xs text-[#666]">{tx.date}</td>
                            <td className="px-6 py-4 text-xs font-mono text-[#666]">{tx.userId}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                tx.type === 'deposit' ? 'bg-green-50 text-green-700' :
                                tx.type === 'withdrawal' ? 'bg-red-50 text-red-700' :
                                'bg-blue-50 text-blue-700'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{tx.title}</td>
                            <td className="px-6 py-4 font-bold text-sm">
                              <span className={tx.amount > 0 ? 'text-green-700' : 'text-red-700'}>
                                {tx.amount > 0 ? '+' : ''}K {Math.abs(tx.amount).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-green-700 uppercase">COMPLETED</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'requests' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#999] text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Tenure</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {loanRequests.filter(req => req.userName.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                    <tr key={`admin-loan-${req.id}`} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm">{req.userName}</p>
                        <p className="text-[10px] text-[#999]">ID: {req.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-[#666]">{req.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-600">{req.tenure || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-green-700">K {(req.amount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#999]">{req.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          req.status === 'approved' ? 'bg-green-50 text-green-700' : 
                          req.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(req.id)}
                              className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-700 hover:text-white transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'users' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#999] text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">NRC Number</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                    <tr key={`admin-user-${user.id}`} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <p className="font-bold text-sm">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-[#666]">{user.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-[#666]">{user.nrc}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-green-700">K {(user.balance || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        {user.location ? (
                          <a 
                            href={`https://www.google.com/maps?q=${user.location.lat},${user.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            <MapPin className="w-3 h-3" />
                            VIEW_MAP
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#999] font-bold">NO_DATA</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit User"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => downloadDossier(user)}
                            className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-700 hover:text-white transition-all"
                            title="Download Dossier"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedUserForChat(user);
                              setActiveTab('chat');
                            }}
                            className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                            title="Chat with User"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const updatedUsers = users.map(u => u.id === user.id ? { ...u, isFrozen: !u.isFrozen } : u);
                              setUsers(updatedUsers);
                              localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
                              alert(`User account ${user.isFrozen ? 'unfrozen' : 'frozen'} successfully.`);
                            }}
                            className={`p-2 rounded-xl transition-all ${
                              user.isFrozen ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                            }`}
                            title={user.isFrozen ? "Unfreeze Account" : "Freeze Account"}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'system' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-[#E5E5E5] p-8 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4">
                  <Shield className="w-5 h-5 text-green-700" />
                  <h2 className="text-xl font-bold">Admin Controls</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Restricted Access
                    </h3>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      System-level configurations (App Name, Logo, AI Core) are restricted to the **Developer Panel**. Administrators can only manage users, loans, and operational status.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Maintenance Mode</label>
                    <div className="flex items-center gap-4 p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E5E5]">
                      <button 
                        onClick={() => {
                          const newConfig = { ...config, maintenanceMode: !config.maintenanceMode };
                          setConfig(newConfig);
                          localStorage.setItem('moneylink_config', JSON.stringify(newConfig));
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${config.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                      </button>
                      <span className="text-xs font-bold">{config.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                  </div>
                </div>

                {/* Published App Download Section */}
                {config.downloadUrl && (
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Published Application
                    </h3>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      The developer has published a new version of the application. You can download it below.
                    </p>
                    <a 
                      href={config.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD_PUBLISHED_APP
                    </a>
                  </div>
                )}

                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Admin Responsibilities
                  </h3>
                  <ul className="text-[10px] text-blue-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Verify user identities via NRC documents.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Approve or reject loan requests based on creditworthiness.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Manage user balances and resolve transaction disputes.
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : activeTab === 'workplace' ? (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Total Disbursed</p>
                    <h3 className="text-3xl font-black text-green-700">K {loanRequests.filter(r => r.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      +12.5% from last month
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Active Users</p>
                    <h3 className="text-3xl font-black text-blue-700">{users.length}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600">
                      <Users className="w-3 h-3" />
                      {users.filter(u => u.isVerified).length} Verified
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Pending Requests</p>
                    <h3 className="text-3xl font-black text-amber-700">{loanRequests.filter(r => r.status === 'pending').length}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600">
                      <Zap className="w-3 h-3" />
                      Requires immediate action
                    </div>
                  </div>
                </div>

                {/* Company Tax Section */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-green-700" />
                      Company Tax & Compliance
                    </h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase">
                      Status: COMPLIANT
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Tax ID</p>
                      <p className="font-mono font-bold text-sm">{currentAdmin?.id ? `TAX-${currentAdmin.id.substring(0, 8).toUpperCase()}` : 'PENDING'}</p>
                    </div>
                    <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5]">
                      <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Next Filing Due</p>
                      <p className="font-bold text-sm">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => alert('Tax Filing Portal Opening...')}
                      className="p-4 bg-green-700 text-white rounded-2xl font-bold text-xs hover:bg-green-800 transition-all shadow-lg shadow-green-700/20"
                    >
                      FILE_MONTHLY_RETURN
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Loan Requests by Type</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Personal', count: loanRequests.filter(r => r.type === 'Personal').length },
                            { name: 'Business', count: loanRequests.filter(r => r.type === 'Business').length },
                            { name: 'Emergency', count: loanRequests.filter(r => r.type === 'Emergency').length },
                            { name: 'Education', count: loanRequests.filter(r => r.type === 'Education').length },
                            { name: 'Salary', count: loanRequests.filter(r => r.type === 'Salary').length },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#F8F9FA' }}
                          />
                          <Bar dataKey="count" fill="#15803D" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm">
                    <h3 className="text-lg font-bold mb-6">User Verification Status</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Verified', value: users.filter(u => u.isVerified).length },
                              { name: 'Pending', value: users.filter(u => !u.isVerified).length },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#15803D" />
                            <Cell fill="#E5E5E5" />
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Recent System Activity</h3>
                  <div className="space-y-4">
                    {adminNotifications.slice(0, 5).map((notif, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 hover:bg-[#F8F9FA] rounded-2xl transition-all border border-transparent hover:border-[#F0F0F0]">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          notif.type === 'loan' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-700'
                        }`}>
                          {notif.type === 'loan' ? <Wallet className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">{notif.title}</p>
                          <p className="text-xs text-[#666]">{notif.message}</p>
                        </div>
                        <p className="text-[10px] font-bold text-[#999]">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'storage' ? (
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black">Cloud Storage</h2>
                  <label className="px-6 py-3 bg-green-700 text-white rounded-2xl font-bold text-xs cursor-pointer hover:bg-green-800 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    UPLOAD_FILE
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {files.map(file => (
                    <div key={file.id} className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm group relative">
                      <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm truncate">{file.name}</p>
                      <p className="text-[10px] text-[#999]">{file.size} • {file.date}</p>
                      
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => downloadFile(file)}
                          className="flex-1 py-2 bg-[#F8F9FA] rounded-xl text-[10px] font-bold hover:bg-green-50 hover:text-green-700 transition-all flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          GET
                        </button>
                        <button 
                          onClick={() => deleteFile(file.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {files.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[#E5E5E5] rounded-[3rem]">
                      <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-[#999]">No files uploaded yet</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#F0F0F0] pt-8">
                  <h3 className="text-lg font-bold mb-6">User Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                      <div key={user.id} className="bg-[#F8F9FA] p-6 rounded-3xl border border-[#E5E5E5] space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-[10px] text-[#999]">{user.phone}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <p className="text-[8px] font-bold text-[#999] uppercase">NRC Front</p>
                            <div className="aspect-video bg-white rounded-lg border border-[#EEE] flex items-center justify-center overflow-hidden">
                              {user.nrcFront ? (
                                <img 
                                  src={user.nrcFront} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }} 
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-[#CCC]" />
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-bold text-[#999] uppercase">NRC Back</p>
                            <div className="aspect-video bg-white rounded-lg border border-[#EEE] flex items-center justify-center overflow-hidden">
                              {user.nrcBack ? (
                                <img 
                                  src={user.nrcBack} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"; }} 
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-[#CCC]" />
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => downloadDossier(user)}
                          className="w-full py-2 bg-white border border-[#E5E5E5] rounded-xl text-[10px] font-bold hover:bg-green-50 hover:text-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <FileDown className="w-3 h-3" />
                          Download Dossier (PDF)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'chat' ? (
              <div className="flex h-[600px]">
                <div className="w-1/3 border-r border-[#F0F0F0] overflow-y-auto">
                  {users.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => setSelectedUserForChat(user)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-[#F9F9F9] transition-all border-b border-[#F0F0F0] ${selectedUserForChat?.id === user.id ? 'bg-green-50' : ''}`}
                    >
                      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-[10px] text-[#999] truncate w-32">Click to chat...</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex flex-col bg-[#F8F9FA]">
                  {selectedUserForChat ? (
                    <>
                      <div className="p-4 bg-white border-b border-[#F0F0F0] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {selectedUserForChat.name.charAt(0)}
                          </div>
                          <p className="font-bold text-sm">{selectedUserForChat.name}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedUserForChat(null)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {chatMessages
                          .filter(m => m.senderId === selectedUserForChat.id || m.receiverId === selectedUserForChat.id)
                          .map(msg => (
                            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-3 rounded-2xl text-xs font-medium ${msg.isAdmin ? 'bg-green-700 text-white rounded-tr-none' : 'bg-white border border-[#E5E5E5] rounded-tl-none'}`}>
                                {msg.text}
                                <p className={`text-[8px] mt-1 ${msg.isAdmin ? 'text-white/60' : 'text-[#999]'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="p-4 bg-white border-t border-[#F0F0F0] flex gap-2">
                        <input 
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your message..."
                          className="flex-1 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm outline-none focus:border-green-700"
                        />
                        <button 
                          onClick={handleSendMessage}
                          className="p-2 bg-green-700 text-white rounded-xl hover:bg-green-800"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#999] space-y-4">
                      <MessageSquare className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">Select a user to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'services' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-8 border-b border-[#F0F0F0] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">User Services</h2>
                    <p className="text-[#666] text-xs mt-1">Manage recurring payments and digital service subscriptions.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8F9FA] text-[#999] text-[10px] uppercase tracking-widest">
                        <th className="px-8 py-4 font-bold">Service</th>
                        <th className="px-8 py-4 font-bold">User ID</th>
                        <th className="px-8 py-4 font-bold">Amount</th>
                        <th className="px-8 py-4 font-bold">Frequency</th>
                        <th className="px-8 py-4 font-bold">Next Date</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F0]">
                      {recurringPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-12 text-center text-[#999] text-xs italic">No active recurring payments found.</td>
                        </tr>
                      ) : (
                        recurringPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                            <td className="px-8 py-4">
                              <span className="font-bold text-sm">{p.serviceName}</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-xs font-mono text-[#666]">{p.userId}</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="font-bold text-sm text-green-700">K {p.amount}</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{p.frequency}</span>
                            </td>
                            <td className="px-8 py-4 text-xs text-[#666]">{p.nextBillingDate}</td>
                            <td className="px-8 py-4 text-right">
                              <button 
                                onClick={() => deleteRecurring(p.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2">Total Users</p>
                    <p className="text-3xl font-black text-green-900">{users.length}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">Pending Loans</p>
                    <p className="text-3xl font-black text-blue-900">{loanRequests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Total Disbursed</p>
                    <p className="text-3xl font-black text-amber-900">
                      K {loanRequests.filter(r => r.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] p-8 rounded-[2rem] border border-[#E5E5E5]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-700" />
                    Admin Workplace Information
                  </h3>
                  <div className="space-y-4 text-sm text-[#666] leading-relaxed">
                    <p>
                      Welcome to the MoneyLink Admin Workplace. As an administrator, you have full control over the platform's financial operations and user management.
                    </p>
                    
                    {/* Export Section */}
                    <div className="mt-8 p-6 bg-white rounded-3xl border border-[#E5E5E5] space-y-4">
                      <h4 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                        <Download className="w-4 h-4 text-green-700" />
                        System Data Export
                      </h4>
                      <p className="text-xs text-[#999]">Download the current system state for backup or reporting purposes.</p>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={exportToJson}
                          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-xs font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20"
                        >
                          <FileText className="w-4 h-4" />
                          Export as JSON
                        </button>
                        <button 
                          onClick={exportToSvg}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-xs font-bold hover:bg-[#F8F9FA] transition-all"
                        >
                          <ImageIcon className="w-4 h-4 text-green-700" />
                          Export as SVG Report
                        </button>
                        <button 
                          onClick={exportToPdf}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-xs font-bold hover:bg-[#F8F9FA] transition-all"
                        >
                          <FileDown className="w-4 h-4 text-green-700" />
                          Export as PDF
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('https://ais-pre-sw6ggrbywtxhqivnqai5qr-93241412631.europe-west1.run.app');
                            alert('App Link copied to clipboard!');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-xs font-bold hover:bg-[#F8F9FA] transition-all"
                        >
                          <LinkIcon className="w-4 h-4 text-green-700" />
                          Copy App Link
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#1A1A1A]">Operational Guidelines:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Verify NRC documents before approving large loans.</li>
                          <li>Monitor transaction history for suspicious activity.</li>
                          <li>Ensure all users have completed selfie verification.</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#1A1A1A]">System Security:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Admin credentials are fixed: 709580 / 709580.</li>
                          <li>Always log out after completing administrative tasks.</li>
                          <li>Data is stored locally and encrypted for security.</li>
                        </ul>
                      </div>
                    </div>

                    {/* APK Note */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-blue-900">Mobile App (APK) Note:</h5>
                        <p className="text-[10px] text-blue-700 leading-relaxed">
                          To use this system as a mobile app, open the shared link in your mobile browser and select "Add to Home Screen". This creates a web-app experience (PWA) that functions like a native APK.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Edit Modal */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
              >
                <button 
                  onClick={() => setEditingUser(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full"
                >
                  <XCircle className="w-5 h-5 text-[#999]" />
                </button>
                
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Edit User Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm font-bold focus:outline-none focus:border-green-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm font-bold focus:outline-none focus:border-green-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Balance (K)</label>
                      <input 
                        type="number"
                        value={editingUser.balance || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm font-bold focus:outline-none focus:border-green-700"
                        placeholder="Enter balance"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <span className="text-xs font-bold text-green-700">Verification Status</span>
                      <button 
                        onClick={() => setEditingUser({ ...editingUser, isVerified: !editingUser.isVerified })}
                        className={`w-10 h-5 rounded-full transition-all relative ${editingUser.isVerified ? 'bg-green-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${editingUser.isVerified ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                      <span className="text-xs font-bold text-red-700">Freeze Account</span>
                      <button 
                        onClick={() => setEditingUser({ ...editingUser, isFrozen: !editingUser.isFrozen })}
                        className={`w-10 h-5 rounded-full transition-all relative ${editingUser.isFrozen ? 'bg-red-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${editingUser.isFrozen ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUpdateUser(editingUser)}
                    className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-700/20"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <SupportChat currentUser={null} role="admin" config={config} />
      </div>
    </div>
  );
};

export default AdminPanel;
