import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { motion } from 'motion/react';
import { 
  Brain,
  Settings, 
  Users, 
  Cpu, 
  Shield, 
  LogOut, 
  Save, 
  Terminal,
  Database,
  Bell,
  MessageSquare,
  X,
  RefreshCw,
  Activity,
  Globe,
  Layout,
  Toolbox,
  Network,
  Eye,
  Image as ImageIcon,
  Lock,
  Smartphone,
  Server,
  Zap,
  MapPin,
  Video,
  Play,
  Wrench,
  Plus,
  Trash2,
  Check,
  UserPlus,
  Briefcase,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import { User, AIServer, SystemConfig, Admin, AppRequest, Meeting, StreamingApp, Tool, Agent } from '../types';

import SupportChat from './SupportChat';
import LiveMeeting from './LiveMeeting';

import TaskManager from './TaskManager';

interface DeveloperPanelProps {
  onLogout: () => void;
}

const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onLogout }) => {
  const [activePanel, setActivePanel] = useState<'system' | 'users' | 'agents' | 'ai' | 'database' | 'logs' | 'toolbox' | 'invitations' | 'memory' | 'admins' | 'app-requests' | 'meetings' | 'tools' | 'streaming' | 'storage' | 'browser' | 'code-editor' | 'tasks'>('system');
  const [config, setConfig] = useState<SystemConfig>({
    appName: 'MoneyLink Financial',
    appLogo: logo,
    aiPrompt: 'You are a helpful banking assistant for MoneyLink Financial.',
    primaryColor: '#15803d',
    maintenanceMode: false,
    twoFactorEnabled: true,
    biometricEnabled: true
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [appRequests, setAppRequests] = useState<AppRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [streamingApps, setStreamingApps] = useState<StreamingApp[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [files, setFiles] = useState<{ id: string, name: string, size: string, type: string, date: string, content?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDbKey, setEditingDbKey] = useState<{key: string, value: string} | null>(null);
  const [browserUrl, setBrowserUrl] = useState('https://derickmusiyalike.com');
  const [isRecording, setIsRecording] = useState(false);
  const [showLiveMeeting, setShowLiveMeeting] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<'regulatory' | 'social' | 'other'>('other');

  const addExternalLink = () => {
    if (!newLinkName || !newLinkUrl) return;
    const newLink = {
      id: Date.now().toString(),
      name: newLinkName,
      url: newLinkUrl,
      category: newLinkCategory
    };
    setConfig(prev => ({
      ...prev,
      externalLinks: [...(prev.externalLinks || []), newLink]
    }));
    setNewLinkName('');
    setNewLinkUrl('');
    addLog(`Added External Link: ${newLinkName}`, 'info');
  };

  const removeExternalLink = (id: string) => {
    setConfig(prev => ({
      ...prev,
      externalLinks: (prev.externalLinks || []).filter(l => l.id !== id)
    }));
    addLog(`Removed External Link ID: ${id}`, 'warn');
  };

  const [codeContent, setCodeContent] = useState(`// ${config.appName} - App Builder
// Use this to develop and publish webs/apps for free

function buildApp() {
  console.log("Building new application...");
  // Add your logic here
}

buildApp();`);
  
  const [invitationEmail, setInvitationEmail] = useState(`Subject: Invitation to join ${config.appName} Admin Team

Hello,

You have been invited to join the administrative team of ${config.appName}. 
As an administrator, you will have full access to manage users, loan requests, and financial operations.

Access Link: \${window.location.origin}/admin
Admin Credentials:
Username: 709580
Password: [Contact Developer for Security Code]

Please log in and complete your profile setup.

Regards,
Development Team`);
  
  const [users, setUsers] = useState<User[]>([]);
  const [aiServers, setAiServers] = useState<AIServer[]>([
    { id: '1', name: 'Gemini Flash 3', url: 'https://api.google.com/gemini', status: 'online', model: 'gemini-3-flash', type: 'text' },
    { id: '2', name: 'OpenAI GPT-4o Free', url: 'https://api.openai.com/v1', status: 'online', model: 'gpt-4o', type: 'text' },
    { id: '3', name: 'Stable Diffusion XL', url: 'https://api.stability.ai', status: 'maintenance', model: 'sdxl-1.0', type: 'image' },
  ]);
  const [dbKeys, setDbKeys] = useState<{key: string, value: string}[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'warn' | 'error'}[]>([]);
  const [featureFlags, setFeatureFlags] = useState({
    darkMode: false,
    experimentalUI: false,
    highSecurity: true
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPartner = params.get('mode') === 'dmi';
    
    const storedUsers = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
    setUsers(storedUsers);
    
    const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
    const defaultConfig: SystemConfig = {
      appName: isPartner ? 'DERICK MUSIYALIKE INSTITUTION (DMI)' : 'MoneyLink Financial',
      appLogo: isPartner 
        ? 'https://ui-avatars.com/api/?name=D+M+I&background=1e3a8a&color=fff&size=200&font-size=0.5&length=3&bold=true'
        : logo,
      aiPrompt: isPartner ? 'You are a helpful banking assistant for DERICK MUSIYALIKE INSTITUTION (DMI).' : 'You are a helpful banking assistant for MoneyLink Financial.',
      primaryColor: isPartner ? '#1e3a8a' : '#15803d',
      maintenanceMode: false,
      twoFactorEnabled: true,
      biometricEnabled: true,
      externalLinks: [
        { id: 'boz', name: 'Bank of Zambia', url: 'https://www.boz.zm', category: 'regulatory' },
        { id: 'fb', name: 'Facebook (Free Mode)', url: 'https://facebook.com', category: 'social' }
      ]
    };
    
    if (isPartner) {
      setConfig(defaultConfig);
    } else if (Object.keys(storedConfig).length > 0) {
      setConfig(prev => ({ ...prev, ...storedConfig }));
    }

    // Fetch AI Servers and System Config from backend
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

    Promise.all([
      fetchWithFallback('/api/servers'),
      fetchWithFallback('/api/system-config', {})
    ]).then(([serversData, configData]) => {
      if (serversData && serversData.length > 0) {
        setAiServers(serversData);
      }
      
      if (configData && Object.keys(configData).length > 0) {
        setConfig(prev => ({ ...prev, ...configData }));
      }
    });

    // Load DB Keys
    refreshDbKeys();
    fetchData();

    // Mock Logs
    setLogs([
      { time: new Date().toLocaleTimeString(), msg: 'System Boot Sequence Initialized', type: 'info' },
      { time: new Date().toLocaleTimeString(), msg: 'Database Connection Established', type: 'info' },
      { time: new Date().toLocaleTimeString(), msg: 'User Session Verified', type: 'info' },
      { time: new Date().toLocaleTimeString(), msg: 'Encryption Layer Active', type: 'info' },
    ]);
  }, []);

  const refreshDbKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push({ key, value: localStorage.getItem(key) || '' });
      }
    }
    setDbKeys(keys);
  };

  const [agentRequests, setAgentRequests] = useState<any[]>([]);

  const fetchData = async () => {
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

    const [adminsData, agentsData, requestsData, meetingsData, streamingData, toolsData, usersData, agentReqData] = await Promise.all([
      fetchWithFallback('/api/admins'),
      fetchWithFallback('/api/agents'),
      fetchWithFallback('/api/app-requests'),
      fetchWithFallback('/api/meetings'),
      fetchWithFallback('/api/streaming-apps?category=developer'),
      fetchWithFallback('/api/tools'),
      fetchWithFallback('/api/users'),
      fetchWithFallback('/api/agent-requests')
    ]);
    
    setAdmins(adminsData);
    setAgents(agentsData);
    setAppRequests(requestsData);
    setMeetings(meetingsData);
    setStreamingApps(streamingData);
    setTools(toolsData);
    setUsers(usersData);
    setAgentRequests(agentReqData);
  };

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('moneylink_dev_files') || '[]');
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
      localStorage.setItem('moneylink_dev_files', JSON.stringify(updatedFiles));
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem('moneylink_dev_files', JSON.stringify(updatedFiles));
  };

  const downloadFile = (file: any) => {
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    a.click();
  };

  const updateDbKey = (key: string, value: string) => {
    try {
      JSON.parse(value); // Validate JSON
      localStorage.setItem(key, value);
      setEditingDbKey(null);
      refreshDbKeys();
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `Updated DB Key: ${key}`, type: 'info' }, ...prev]);
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const deleteDbKey = (key: string) => {
    if (window.confirm(`Delete ${key}?`)) {
      localStorage.removeItem(key);
      refreshDbKeys();
      addLog(`Deleted DB Key: ${key}`, 'warn');
    }
  };

  const saveConfig = async () => {
    localStorage.setItem('moneylink_config', JSON.stringify(config));
    
    try {
      await fetch('/api/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      addLog('System Configuration Synced to Backend', 'info');
      alert('System Configuration Updated Successfully!');
      // Reload to apply changes globally if needed, or rely on state
      window.location.reload(); 
    } catch (error) {
      console.error('Failed to sync config:', error);
      alert('Saved locally, but failed to sync to backend.');
    }
  };

  const saveAiServers = async () => {
    try {
      // For each server, update or create on backend
      for (const server of aiServers) {
        await fetch(`/api/servers/${server.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(server)
        }).then(res => {
          if (res.status === 404) {
            return fetch('/api/servers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(server)
            });
          }
        });
      }
      addLog('AI Servers Synchronized with Backend', 'info');
      alert('AI Servers Configuration Saved to Backend!');
    } catch (error) {
      console.error('Failed to save servers:', error);
      alert('Failed to save servers to backend.');
    }
  };

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const updateAiServer = (id: string, updates: Partial<AIServer>) => {
    setAiServers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleAICommand = () => {
    const cmd = aiCommand.toLowerCase().trim();
    if (!cmd) return;

    if (cmd.startsWith('create ')) {
      const what = cmd.replace('create ', '');
      addLog(`AI: Initiated creation sequence for "${what}"`, 'info');
      if (what.includes('user')) {
        // Mock user creation
        const newUser: User = {
          id: Date.now().toString(),
          name: 'AI_Generated_User',
          phone: '0000000000',
          nrc: 'AI-GEN',
          isRegistered: true,
          balance: 0,
          isVerified: true,
          isFrozen: false,
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [newUser, ...prev]);
        addLog(`AI: User ${newUser.name} created successfully`, 'info');
      }
    } else if (cmd.startsWith('bring ')) {
      const what = cmd.replace('bring ', '');
      addLog(`AI: Fetching data for "${what}" from secure archives...`, 'info');
    } else if (cmd.startsWith('upload ')) {
      const what = cmd.replace('upload ', '');
      addLog(`AI: Uploading "${what}" to cloud storage...`, 'info');
    } else if (cmd.startsWith('download ')) {
      const what = cmd.replace('download ', '');
      addLog(`AI: Downloading "${what}" to local system...`, 'info');
    } else if (cmd.startsWith('publish ')) {
      const what = cmd.replace('publish ', '');
      addLog(`AI: Publishing "${what}" to production environment...`, 'info');
      setConfig(prev => ({ ...prev, downloadUrl: 'https://example.com/app.apk' }));
      saveConfig();
    } else if (cmd.startsWith('do ')) {
      const what = cmd.replace('do ', '');
      addLog(`AI: Executing task: ${what}`, 'info');
    } else {
      addLog(`AI: Command not recognized: ${cmd}`, 'warn');
    }
    setAiCommand('');
  };

  const notifyAdmin = () => {
    const notifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
    notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      title: 'DEV_ALERT',
      message: 'Manual system alert triggered from Developer Panel',
      time: new Date().toLocaleString(),
      isRead: false
    });
    localStorage.setItem('moneylink_admin_notifications', JSON.stringify(notifications));
    addLog('Admin Notification Sent', 'info');
    alert('Test Notification Sent to Company Management');
  };

  const wipeData = () => {
    if (confirm('CRITICAL: This will wipe ALL user data and system logs. Proceed?')) {
      localStorage.clear();
      addLog('SYSTEM_WIPE_EXECUTED', 'error');
      alert('System Data Wiped. Reloading...');
      window.location.reload();
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
      
      addLog(`User ${updatedUser.name} updated`, 'info');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
        addLog(`User ${userId} deleted`, 'warn');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };
  const approveRequest = async (request: AppRequest) => {
    // Update request status
    const updatedRequest = { ...request, status: 'approved' };
    await fetch(`/api/app-requests/${request.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRequest)
    });
    
    // Create or update admin
    const adminExists = admins.find(a => a.id === request.adminId);
    
    if (!adminExists) {
      // Create new admin with requested credentials
      const newAdmin: Admin = {
        id: request.adminId !== 'unknown' ? request.adminId : Date.now().toString(),
        username: request.desiredUsername || `admin_${request.requestedName.toLowerCase().replace(/\s/g, '_')}`,
        password: request.desiredPassword || 'password123', // Default if not provided, but UI enforces it
        companyName: request.requestedName,
        approvedAppName: request.requestedName,
        isApproved: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        isMainAdmin: false
      };

      await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      
      setAdmins(prev => [...prev, newAdmin]);
      addLog(`New Admin Created: ${newAdmin.username} for ${newAdmin.companyName}`, 'info');
    } else {
      // Update existing admin
      const updatedAdmin = { 
        ...adminExists,
        approvedAppName: request.requestedName,
        companyName: request.requestedName,
        // If they requested new credentials, update them
        ...(request.desiredUsername && { username: request.desiredUsername }),
        ...(request.desiredPassword && { password: request.desiredPassword })
      };

      await fetch(`/api/admins/${adminExists.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAdmin)
      });
      
      setAdmins(prev => prev.map(a => a.id === adminExists.id ? updatedAdmin : a));
      addLog(`Admin Updated: ${updatedAdmin.username} for ${updatedAdmin.companyName}`, 'info');
    }
    
    setAppRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
    alert(`App Request for "${request.requestedName}" approved! Admin can now login with new credentials.`);
  };

  const removeAdmin = async (id: string) => {
    if (confirm('Permanently remove this admin?')) {
      await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      setAdmins(prev => prev.filter(a => a.id !== id));
      addLog(`Admin ${id} removed permanently`, 'error');
    }
  };

  const hostMeeting = async () => {
    const title = prompt('Enter Meeting Title:');
    if (!title) return;
    
    const linksInput = prompt('Enter Social Media Links (comma separated, e.g., Facebook:url,Twitter:url) or leave empty:');
    const socialLinks = linksInput ? linksInput.split(',').map(link => {
      const [platform, url] = link.split(':');
      return { platform: platform?.trim() || 'Link', url: url?.trim() || '#' };
    }) : [];

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      hostId: 'developer',
      title,
      startTime: new Date().toISOString(),
      status: 'live',
      streamUrl: `https://meet.jit.si/MoneyLink_${Date.now()}`,
      socialLinks
    };
    
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeeting)
    });
    
    // Notify all admins
    const notifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
    notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      title: 'LIVE_MEETING_ALERT',
      message: `Developer has started a live meeting: ${title}. Join now!`,
      time: new Date().toLocaleString(),
      isRead: false,
      type: 'meeting'
    });
    localStorage.setItem('moneylink_admin_notifications', JSON.stringify(notifications));
    
    setMeetings(prev => [newMeeting, ...prev]);
    alert('Meeting is now LIVE! Admins have been notified.');
  };

  const updateAdminPassword = async (id: string) => {
    const newPass = prompt('Enter new password for Admin:');
    if (!newPass) return;
    await fetch(`/api/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass })
    });
    alert('Admin password updated successfully.');
  };

  const updateAdminUsername = async (id: string) => {
    const newUsername = prompt('Enter new username for Admin:');
    if (!newUsername) return;
    await fetch(`/api/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername })
    });
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, username: newUsername } : a));
    alert('Admin username updated successfully.');
  };

  const toggleFlag = (flag: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
    addLog(`Feature Flag Updated: ${flag}`, 'info');
  };

  const handlePublish = async () => {
    const publishedUrl = 'https://ais-pre-u3fr2mz2gqmc5b4bgmkntf-93241412631.europe-west1.run.app';
    setConfig(prev => ({ ...prev, downloadUrl: publishedUrl }));
    await fetch('/api/system-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, downloadUrl: publishedUrl })
    });
    addLog(`App Published Successfully: ${publishedUrl}`, 'info');
    alert(`App Published! Share this link: ${publishedUrl}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={config.appLogo} 
                alt="DMI Logo" 
                className="w-14 h-14 object-contain rounded-2xl shadow-2xl border border-blue-400/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logo;
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">{config.appName.toUpperCase()}</h1>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Main Operating System: Authorized</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            TERMINATE_SESSION
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActivePanel('system')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'system' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            SYSTEM_CONFIG
          </button>
          <button
            onClick={() => setActivePanel('users')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            USER_OVERRIDE
          </button>
          <button
            onClick={() => setActivePanel('agents')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'agents' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            AGENT_OVERRIDE
          </button>
          <button
            onClick={() => setActivePanel('ai')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'ai' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI_INTEGRATION
          </button>
          <button
            onClick={() => setActivePanel('database')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'database' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            DB_EXPLORER
          </button>
          <button
            onClick={() => setActivePanel('storage')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'storage' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            STORAGE
          </button>
          <button
            onClick={() => setActivePanel('browser')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'browser' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            BROWSER
          </button>
          <button
            onClick={() => setActivePanel('code-editor')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'code-editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            APP_BUILDER
          </button>
          <button
            onClick={() => setActivePanel('logs')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            LOG_STREAM
          </button>
          <button
            onClick={() => setActivePanel('invitations')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'invitations' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            ADMIN_INVITE
          </button>
          <button
            onClick={() => setActivePanel('toolbox')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'toolbox' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Toolbox className="w-4 h-4" />
            TOOLBOX
          </button>
          <button
            onClick={() => setActivePanel('memory')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'memory' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            APP_MEMORY
          </button>
          <button
            onClick={() => setActivePanel('admins')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'admins' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            ADMIN_MGMT
          </button>
          <button
            onClick={() => setActivePanel('app-requests')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'app-requests' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            APP_REQUESTS
          </button>
          <button
            onClick={() => setActivePanel('meetings')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'meetings' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            MEETINGS
          </button>
          <button
            onClick={() => setActivePanel('tools')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'tools' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            DEV_TOOLS
          </button>
          <button
            onClick={() => setActivePanel('tasks')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'tasks' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            TASKS
          </button>
          <button
            onClick={() => setActivePanel('streaming')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePanel === 'streaming' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            STREAMING
          </button>
        </div>

        {/* Main Panel Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activePanel === 'admins' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Admin Management</h2>
                  <span className="text-[10px] font-bold bg-blue-600 px-2 py-1 rounded-md">{admins.length} TOTAL_ADMINS</span>
                </div>
                <div className="space-y-4">
                  {admins.map(admin => (
                    <div key={admin.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{admin.companyName}</p>
                        <p className="text-[10px] text-white/40">User: {admin.username} | ID: {admin.id}</p>
                        <p className="text-[10px] text-blue-400 font-bold mt-1">STATUS: {admin.status.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateAdminUsername(admin.id)} className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all" title="Change Username">
                          <Users className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateAdminPassword(admin.id)} className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all" title="Change Password">
                          <Lock className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeAdmin(admin.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all" title="Remove Admin">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'app-requests' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">New App Requests</h2>
                  <span className="text-[10px] font-bold bg-amber-600 px-2 py-1 rounded-md">{appRequests.filter(r => r.status === 'pending').length} PENDING</span>
                </div>
                <div className="space-y-4">
                  {appRequests.map(req => (
                    <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Requested: {req.requestedName}</p>
                        <p className="text-[10px] text-white/40">By: {req.createdBy} | Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                        <p className={`text-[10px] font-bold mt-1 ${req.status === 'approved' ? 'text-green-400' : 'text-amber-400'}`}>
                          STATUS: {req.status.toUpperCase()}
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => approveRequest(req)} className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-all">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'meetings' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-red-400" />
                    <h2 className="text-xl font-bold">Admin Meeting Center</h2>
                  </div>
                  {!showLiveMeeting && (
                    <button onClick={() => setShowLiveMeeting(true)} className="px-6 py-3 bg-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      JOIN_LIVE_MEETING
                    </button>
                  )}
                </div>
                
                {showLiveMeeting ? (
                  <div className="h-[600px] relative">
                    <LiveMeeting 
                      userId="developer"
                      userName="Developer"
                      onLeave={() => setShowLiveMeeting(false)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center space-y-4">
                      <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                        <Video className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold">Live Video Conference</h3>
                      <p className="text-sm text-white/60">Connect with admins and agents in real-time using the built-in video meeting system.</p>
                      <button onClick={() => setShowLiveMeeting(true)} className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-600/20">
                        ENTER MEETING ROOM
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activePanel === 'tools' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Developer Tools</h2>
                  <input 
                    type="text" 
                    placeholder="Search tools..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((tool) => (
                    <div key={tool.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-xs">{tool.name}</p>
                      </div>
                      <p className="text-[10px] text-white/40">{tool.description}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded ${tool.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'}`}>
                          {tool.status.toUpperCase()}
                        </span>
                        <span className="text-[8px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">SYSTEM</span>
                      </div>
                    </div>
                  ))}
                  {tools.length === 0 && (
                    <p className="text-xs text-white/40 col-span-full text-center py-8">No tools found in database.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activePanel === 'streaming' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Streaming Apps & Systems</h2>
                  <span className="text-[10px] font-bold text-white/40">CATEGORY: DEVELOPER</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {streamingApps.map((app) => (
                    <a 
                      key={app.id} 
                      href={app.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group p-4 text-center"
                    >
                      <Smartphone className="w-6 h-6 text-white/20 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-bold">{app.name}</p>
                      <span className={`text-[8px] px-2 py-0.5 rounded ${app.status === 'online' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </a>
                  ))}
                  {streamingApps.length === 0 && (
                    <p className="text-xs text-white/40 col-span-full text-center py-8">No streaming apps found.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activePanel === 'memory' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Brain className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold">App Memory & State Management</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-pink-500/5 border border-pink-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold">Session Memory</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">Active Components</span>
                        <span className="text-pink-400">14</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">State Objects</span>
                        <span className="text-pink-400">42</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">Memory Usage</span>
                        <span className="text-pink-400">12.4 MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold">Persistent Memory</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">LocalStorage Keys</span>
                        <span className="text-blue-400">{dbKeys.length}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">Total Storage Size</span>
                        <span className="text-blue-400">{(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">AI Context Memory</h3>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-white/60 leading-relaxed">
                    [SYSTEM_CONTEXT]: User is logged in as {users.find(u => u.id === JSON.parse(localStorage.getItem('moneylink_current_user') || '{}').id)?.name || 'Guest'}.
                    [SESSION_HISTORY]: User navigated to Account {'->'} Developer Panel.
                    [PREFERENCES]: Dark mode is {featureFlags.darkMode ? 'ENABLED' : 'DISABLED'}.
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      addLog('Memory Cache Flushed', 'warn');
                      alert('Application Cache and Memory Flushed.');
                    }}
                    className="flex-1 bg-pink-600/20 border border-pink-600/40 text-pink-400 py-4 rounded-2xl font-bold text-xs hover:bg-pink-600/30 transition-all"
                  >
                    FLUSH_MEMORY_CACHE
                  </button>
                  <button 
                    onClick={() => {
                      addLog('State Re-indexed', 'info');
                      alert('Application State Re-indexed.');
                    }}
                    className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all"
                  >
                    REINDEX_STATE
                  </button>
                </div>
              </motion.div>
            )}

            {activePanel === 'system' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold">Global System Parameters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Application Name</label>
                    <input 
                      type="text"
                      value={config.appName}
                      onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Status</label>
                    <select 
                      value={config.maintenanceMode ? 'Maintenance' : 'Operational'}
                      onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.value === 'Maintenance' })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Version (Triggers Update)</label>
                    <input 
                      type="text"
                      value={config.version || '1.0.0'}
                      onChange={(e) => setConfig({ ...config, version: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. 1.0.1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Application Logo URL</label>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      value={config.appLogo}
                      onChange={(e) => setConfig({ ...config, appLogo: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    />
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/20">
                      <img 
                        src={config.appLogo} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/200x200/15803d/ffffff?text=LM";
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Published App Download URL (For Admins)</label>
                  <input 
                    type="text"
                    value={config.downloadUrl || ''}
                    onChange={(e) => setConfig({ ...config, downloadUrl: e.target.value })}
                    placeholder="https://example.com/download/app.apk"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Primary Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Security Overrides
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">2FA Authentication</span>
                        <button 
                          onClick={() => setConfig({ ...config, twoFactorEnabled: !config.twoFactorEnabled })}
                          className={`w-10 h-5 rounded-full transition-all relative ${config.twoFactorEnabled ? 'bg-green-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.twoFactorEnabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Biometric Auth</span>
                        <button 
                          onClick={() => setConfig({ ...config, biometricEnabled: !config.biometricEnabled })}
                          className={`w-10 h-5 rounded-full transition-all relative ${config.biometricEnabled ? 'bg-green-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.biometricEnabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">AI Memory Persistence</span>
                        <button 
                          onClick={() => setConfig({ ...config, memoryEnabled: !config.memoryEnabled })}
                          className={`w-10 h-5 rounded-full transition-all relative ${config.memoryEnabled ? 'bg-green-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.memoryEnabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      Database Management
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button onClick={wipeData} className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-bold hover:bg-red-500/20 text-red-500">WIPE_ALL_DATA</button>
                      <button className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold hover:bg-white/10">RESET_LOAN_STATUS</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-400" />
                      <h2 className="text-xl font-bold">External Resources</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(config.externalLinks || []).map((link) => (
                      <div 
                        key={link.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group relative"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          link.category === 'regulatory' ? 'bg-green-900/30 text-green-400' : 
                          link.category === 'social' ? 'bg-blue-900/30 text-blue-400' : 'bg-white/10 text-white'
                        }`}>
                          {link.category === 'regulatory' ? <Shield className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{link.name}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/40 hover:text-blue-400 truncate block max-w-[150px]">{link.url}</a>
                        </div>
                        <button 
                          onClick={() => removeExternalLink(link.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Link Form */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white/60">Add New Resource</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        placeholder="Name (e.g. Google)" 
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="URL (https://...)" 
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 text-white"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={newLinkCategory}
                          onChange={(e) => setNewLinkCategory(e.target.value as any)}
                          className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 flex-1 text-white"
                        >
                          <option value="other">Other</option>
                          <option value="regulatory">Regulatory</option>
                          <option value="social">Social</option>
                        </select>
                        <button 
                          onClick={addExternalLink}
                          disabled={!newLinkName || !newLinkUrl}
                          className="px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={saveConfig}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                >
                  <Save className="w-5 h-5" />
                  COMMIT_CHANGES
                </button>
              </motion.div>
            )}

            {activePanel === 'users' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">User Override Panel</h2>
                  <span className="text-[10px] font-bold bg-blue-600 px-2 py-1 rounded-md">{users.length} TOTAL_RECORDS</span>
                </div>

                <div className="space-y-4">
                  {users.map(user => (
                    <div key={`dev-user-${user.id}`} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-[10px] text-white/40">{user.phone} | {user.nrc}</p>
                        <p className="text-[8px] text-blue-400 font-bold mt-1">ADMIN_ID: {user.adminId || 'GLOBAL'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const newBalance = prompt(`Enter new balance for ${user.name}:`, (user.balance || 0).toString());
                            if (newBalance !== null) {
                              const updatedUser = { ...user, balance: parseFloat(newBalance) };
                              handleUpdateUser(updatedUser);
                            }
                          }}
                          className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'agents' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Agent Management</h2>
                  <span className="text-[10px] font-bold bg-purple-600 px-2 py-1 rounded-md">{agents.length} AGENTS</span>
                </div>

                {/* Agent Requests */}
                {agentRequests.filter(r => r.status === 'pending').length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-bold text-amber-400">Pending Requests</h3>
                    {agentRequests.filter(r => r.status === 'pending').map(req => (
                      <div key={req.id} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{req.name}</p>
                          <p className="text-[10px] text-white/40">{req.email} | {req.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              // Approve Agent
                              await fetch(`/api/agent-requests/${req.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'approved' })
                              });
                              
                              // Create Agent Account
                              const newAgent: Agent = {
                                id: Date.now().toString(),
                                adminId: req.adminId || 'developer',
                                name: req.name,
                                phone: req.phone,
                                status: 'active',
                                joinedAt: new Date().toISOString()
                              };
                              
                              await fetch('/api/agents', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newAgent)
                              });
                              
                              setAgents([...agents, newAgent]);
                              setAgentRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
                              alert('Agent Approved!');
                            }}
                            className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-all"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              await fetch(`/api/agent-requests/${req.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'rejected' })
                              });
                              setAgentRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
                            }}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{agent.name}</p>
                        <p className="text-[10px] text-white/40">{agent.phone} | {agent.status.toUpperCase()}</p>
                        <p className="text-[8px] text-blue-400 font-bold mt-1">ADMIN_ID: {agent.adminId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'browser' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold">Free Internet Browser</h2>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-bold">
                    <Zap className="w-3 h-3" />
                    FREE_DATA_ACTIVE
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={browserUrl}
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setBrowserUrl(e.currentTarget.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={() => {
                      const url = browserUrl.startsWith('http') ? browserUrl : `https://${browserUrl}`;
                      setBrowserUrl(url);
                    }}
                    className="px-6 bg-blue-600 rounded-xl font-bold text-xs"
                  >
                    GO
                  </button>
                </div>

                <div className="flex-1 min-h-[500px] bg-white rounded-3xl overflow-hidden relative border border-white/10">
                  <iframe 
                    src={browserUrl.includes('derickmusiyalike.com') ? 'https://www.google.com/search?q=Derick+Musiyalike+Institution&igu=1' : browserUrl} 
                    className="w-full h-full border-none"
                    title="DMI Free Browser"
                  />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse"></div>
                </div>
              </motion.div>
            )}

            {activePanel === 'code-editor' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold">App Builder & Publisher</h2>
                  </div>
                  <button 
                    onClick={handlePublish}
                    className="px-6 py-2 bg-blue-600 rounded-xl font-bold text-[10px] flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Play className="w-3 h-3" />
                    PUBLISH_FOR_FREE
                  </button>
                </div>
                
                {config.downloadUrl && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live App URL</p>
                      <a href={config.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:underline">{config.downloadUrl}</a>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(config.downloadUrl || '');
                        alert('Link Copied!');
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <textarea 
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full h-[500px] bg-black/40 border border-white/10 rounded-3xl p-8 font-mono text-xs text-blue-300 outline-none focus:border-blue-600 resize-none"
                />
              </motion.div>
            )}

            {activePanel === 'ai' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold">AI Core & Servers</h2>
                  </div>
                  <button onClick={() => setAiServers([...aiServers, { id: Date.now().toString(), name: 'New Server', url: '', status: 'offline', model: '', type: 'text' }])} className="px-4 py-2 bg-purple-600 rounded-xl text-[10px] font-bold">ADD_SERVER</button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Command Terminal</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={aiCommand}
                      onChange={(e) => setAiCommand(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAICommand()}
                      placeholder="Enter command (e.g., create user, publish app, bring logs...)"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-purple-500 text-purple-300"
                    />
                    <button 
                      onClick={handleAICommand}
                      className="px-6 bg-purple-600 rounded-xl font-bold text-xs hover:bg-purple-700 transition-all"
                    >
                      EXECUTE
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Supported: <span className="text-purple-400">do, create, bring, upload, download, publish</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global System Prompt</label>
                  <textarea 
                    value={config.aiPrompt}
                    onChange={(e) => setConfig({ ...config, aiPrompt: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-mono focus:border-purple-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Connected AI Servers</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {aiServers.map(server => (
                      <div key={server.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <input 
                            value={server.name}
                            onChange={(e) => updateAiServer(server.id, { name: e.target.value })}
                            className="bg-transparent border-none font-bold text-sm outline-none focus:text-purple-400"
                          />
                          <select 
                            value={server.status}
                            onChange={(e) => updateAiServer(server.id, { status: e.target.value as any })}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px]"
                          >
                            <option value="online">ONLINE</option>
                            <option value="offline">OFFLINE</option>
                            <option value="maintenance">MAINTENANCE</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            placeholder="API URL"
                            value={server.url}
                            onChange={(e) => updateAiServer(server.id, { url: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px]"
                          />
                          <input 
                            placeholder="Model Name"
                            value={server.model}
                            onChange={(e) => updateAiServer(server.id, { model: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={saveAiServers}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-600/20"
                >
                  <Save className="w-5 h-5" />
                  COMMIT_AI_CONFIG
                </button>
              </motion.div>
            )}

            {activePanel === 'invitations' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold">Admin Invitation System</h2>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Invitation Email Template</label>
                  <textarea 
                    value={invitationEmail}
                    onChange={(e) => setInvitationEmail(e.target.value)}
                    rows={12}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-mono focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(invitationEmail);
                      alert('Invitation Email copied to clipboard!');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-5 h-5" />
                    COPY_INVITATION
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = `mailto:?subject=Invitation to join ${config.appName}&body=${encodeURIComponent(invitationEmail)}`;
                    }}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <Globe className="w-5 h-5" />
                    OPEN_MAIL_CLIENT
                  </button>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Security Note</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Invitations contain sensitive system access information. Ensure you only send this to authorized personnel. The credentials provided are the default system admin credentials.
                  </p>
                </div>
              </motion.div>
            )}

            {activePanel === 'toolbox' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Toolbox className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold">Developer Toolbox</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Network Tools */}
                  <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Network className="w-4 h-4 text-green-400" />
                      Network Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">PING_ALL_SERVERS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">FLUSH_DNS_CACHE</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">TRACE_REQUESTS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">SSL_VERIFY</button>
                    </div>
                  </div>

                  {/* UI Tools */}
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Layout className="w-4 h-4 text-blue-400" />
                      UI/UX Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">TOGGLE_GRID</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">INSPECT_ELEMENTS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">DUMP_DOM_TREE</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">CLEAR_STYLES</button>
                    </div>
                  </div>

                  {/* Data Tools */}
                  <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-400" />
                      Data Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">EXPORT_DB_DUMP</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">IMPORT_DB_DUMP</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">VALIDATE_SCHEMAS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">REINDEX_ALL</button>
                    </div>
                  </div>

                  {/* System Tools */}
                  <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      System Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">REBOOT_CORE</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">FLUSH_SESSIONS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">GENERATE_KEYS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">ROTATE_LOGS</button>
                      <button onClick={() => alert('Cloning app... (This is a placeholder)')} className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">CLONE_APP</button>
                    </div>
                  </div>

                  {/* Server Status */}
                  <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Server className="w-4 h-4 text-gray-400" />
                      Server Status
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">RESTART_ALL_SERVERS</button>
                      <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-white/10">VIEW_SERVER_LOGS</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePanel === 'database' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Local Storage Explorer</h2>
                  <button onClick={() => fetchData()} className="p-2 hover:bg-white/10 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {dbKeys.map(item => (
                    <div key={item.key} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-bold text-xs">{item.key}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingDbKey(item)} className="text-blue-400 hover:text-blue-300">
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteDbKey(item.key)} className="text-red-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg text-[10px] text-white/60 break-all font-mono">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {editingDbKey && (
                  <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-2xl rounded-[2rem] p-8 border border-white/10 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-blue-400">Edit Record: {editingDbKey.key}</h3>
                        <button onClick={() => setEditingDbKey(null)}><X className="w-5 h-5" /></button>
                      </div>
                      <textarea 
                        value={editingDbKey.value}
                        onChange={(e) => setEditingDbKey({ ...editingDbKey, value: e.target.value })}
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs text-blue-300 outline-none focus:border-blue-600"
                      />
                      <button 
                        onClick={() => updateDbKey(editingDbKey.key, editingDbKey.value)}
                        className="w-full bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        COMMIT_CHANGES
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activePanel === 'storage' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Dev Cloud Storage</h2>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Plus className="w-3 h-3" />
                    UPLOAD_ASSET
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {files.map(file => (
                    <div key={file.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{file.name}</p>
                          <p className="text-[8px] text-white/40">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadFile(file)}
                          className="flex-1 py-2 bg-white/5 rounded-lg text-[9px] font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          DOWNLOAD
                        </button>
                        <button 
                          onClick={() => deleteFile(file.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'logs' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">System Log Stream</h2>
                  <button onClick={() => setLogs([])} className="text-[10px] font-bold text-white/40 hover:text-white">CLEAR_LOGS</button>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-2 border-b border-white/5">
                      <span className="text-white/30">[{log.time}]</span>
                      <span className={log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-yellow-500' : 'text-blue-400'}>
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-white/80">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {activePanel === 'tasks' && (
            <div className="h-[600px] bg-white rounded-[2.5rem] overflow-hidden">
              <TaskManager role="developer" currentUser="developer" />
            </div>
          )}

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Contact Info (Restricted) */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Internal Contact</p>
              <div className="flex flex-col gap-2">
                <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="text-[10px] font-bold text-blue-400 hover:underline">derickmusiyalikeinstitution@gmail.com</a>
                <a href="https://wa.me/260774218141" className="text-[10px] font-bold text-blue-400 hover:underline">WhatsApp (+260 774218141)</a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                <Shield className="w-4 h-4" />
                FEATURE_FLAGS
              </h3>
              <div className="space-y-4">
                {Object.entries(featureFlags).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-white/60">{key.replace(/([A-Z])/g, '_$1')}</span>
                    <button 
                      onClick={() => toggleFlag(key as any)}
                      className={`w-10 h-5 rounded-full transition-all relative ${val ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${val ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-red-500">
                <Database className="w-4 h-4" />
                DANGER_ZONE
              </h3>
              <button 
                onClick={wipeData}
                className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all"
              >
                WIPE_ALL_DATA
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                <Bell className="w-4 h-4" />
                SYSTEM_LOGS
              </h3>
              <div className="space-y-3 text-[10px] font-mono text-white/40">
                {logs.slice(0, 5).map((log, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className={log.type === 'error' ? 'text-red-500' : 'text-blue-500'}>[{log.type === 'error' ? 'ERR' : 'OK'}]</span> 
                    {log.msg}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                <Shield className="w-4 h-4" />
                ADMIN_TOOLS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={notifyAdmin}
                  className="w-full py-3 bg-blue-600/10 border border-blue-600/30 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-600/20 transition-all"
                >
                  TRIGGER_ADMIN_ALERT
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('moneylink_admin_direct_login', 'true');
                    alert('Direct Login enabled. Go to Company Management to access without credentials.');
                  }}
                  className="w-full py-3 bg-green-600/10 border border-green-600/30 rounded-xl text-[10px] font-bold text-green-400 hover:bg-green-600/20 transition-all"
                >
                  ENABLE_DIRECT_LOGIN
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                <MessageSquare className="w-4 h-4" />
                LIVE_TRAFFIC
              </h3>
              <div className="h-40 flex items-end gap-1">
                {[40, 70, 45, 90, 65, 30, 85, 50, 60, 40, 75, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-600/30 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '20%' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SupportChat currentUser={null} role="developer" config={config} />
    </div>
  );
};

export default DeveloperPanel;
