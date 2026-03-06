import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  LogOut, 
  Search, 
  Plus, 
  Trash2, 
  Wrench, 
  CheckCircle, 
  XCircle,
  Headphones,
  UserPlus,
  FileText,
  Save,
  Video
} from 'lucide-react';
import { User, ChatMessage, Agent, SystemConfig } from '../types';
import SupportChat from './SupportChat';
import LiveMeeting from './LiveMeeting';

import TaskManager from './TaskManager';

interface AgentPanelProps {
  onLogout: () => void;
  agentId: string;
  isDeveloper?: boolean;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ onLogout, agentId, isDeveloper }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'tasks' | 'meeting'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [config, setConfig] = useState<SystemConfig>({
    appName: 'MoneyLink Financial',
    appLogo: '',
    aiPrompt: '',
    primaryColor: '',
    maintenanceMode: false,
    twoFactorEnabled: true,
    biometricEnabled: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, agentsRes, configRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/agents'),
          fetch('/api/system-config')
        ]);
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        } else {
          const storedUsers = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
          setUsers(storedUsers);
        }

        if (agentsRes.ok) {
          const data = await agentsRes.json();
          const agent = data.find((a: Agent) => a.id === agentId);
          setCurrentAgent(agent || null);
        } else {
          const storedAgents = JSON.parse(localStorage.getItem('moneylink_agents') || '[]');
          const agent = storedAgents.find((a: Agent) => a.id === agentId);
          setCurrentAgent(agent || null);
        }

        if (configRes.ok) {
          const data = await configRes.json();
          if (Object.keys(data).length > 0) {
            setConfig(prev => ({ ...prev, ...data }));
          }
        } else {
          const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
          if (Object.keys(storedConfig).length > 0) {
            setConfig(prev => ({ ...prev, ...storedConfig }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch data via API, falling back to local storage', error);
        const storedUsers = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
        setUsers(storedUsers);
        
        const storedAgents = JSON.parse(localStorage.getItem('moneylink_agents') || '[]');
        const agent = storedAgents.find((a: Agent) => a.id === agentId);
        setCurrentAgent(agent || null);

        const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
        if (Object.keys(storedConfig).length > 0) {
          setConfig(prev => ({ ...prev, ...storedConfig }));
        }
      }
    };
    
    fetchData();
  }, [agentId]);

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user via API, falling back to local storage', error);
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
      } catch (error) {
        console.error('Failed to delete user via API, falling back to local storage', error);
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem('moneylink_users', JSON.stringify(updatedUsers));
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A1A1A]">AGENT_PANEL</h1>
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                {currentAgent?.name || 'Customer Service Agent'} • ID: {agentId}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 p-1 bg-[#F0F0F0] rounded-2xl w-full max-w-md">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users' ? 'bg-white shadow-sm text-purple-600' : 'text-[#666]'
            }`}
          >
            <Users className="w-4 h-4" />
            USERS
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chat' ? 'bg-white shadow-sm text-purple-600' : 'text-[#666]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            CHAT
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tasks' ? 'bg-white shadow-sm text-purple-600' : 'text-[#666]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            TASKS
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'meeting' ? 'bg-white shadow-sm text-purple-600' : 'text-[#666]'
            }`}
          >
            <Video className="w-4 h-4" />
            MEETING
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-xl overflow-hidden min-h-[600px]">
          {activeTab === 'users' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                  <div key={`agent-user-${user.id}`} className="p-6 bg-[#F8F9FA] border border-[#E5E5E5] rounded-3xl space-y-4 hover:border-purple-600 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-[10px] text-[#999]">{user.phone}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="flex-1 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[10px] font-bold hover:bg-purple-50 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Wrench className="w-3 h-3" />
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex h-[600px]">
              <div className="w-1/3 border-r border-[#F0F0F0] overflow-y-auto">
                {users.map(user => (
                  <button 
                    key={`agent-chat-user-${user.id}`}
                    onClick={() => setSelectedUserForChat(user)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-[#F9F9F9] transition-all border-b border-[#F0F0F0] ${selectedUserForChat?.id === user.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
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
                  <div className="flex-1 flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-[#F0F0F0] bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          {selectedUserForChat.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold">{selectedUserForChat.name}</h3>
                          <p className="text-xs text-[#999]">Customer Support Session</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]">
                      {(() => {
                        const chatId = selectedUserForChat.id;
                        const messages = JSON.parse(localStorage.getItem(`moneylink_chats_${chatId}`) || '[]');
                        return messages.length > 0 ? (
                          messages.map((msg: ChatMessage) => (
                            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-medium ${
                                msg.isAdmin 
                                  ? 'bg-purple-600 text-white rounded-tr-none' 
                                  : 'bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-tl-none'
                              }`}>
                                {msg.text}
                                <p className={`text-[8px] mt-1 ${msg.isAdmin ? 'text-white/60' : 'text-[#999]'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-[#999]">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">No messages yet</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="p-4 bg-white border-t border-[#F0F0F0] flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const text = input.value.trim();
                            if (!text) return;
                            
                            const chatId = selectedUserForChat.id;
                            const existingMessages = JSON.parse(localStorage.getItem(`moneylink_chats_${chatId}`) || '[]');
                            const newMessage: ChatMessage = {
                              id: Math.random().toString(36).substr(2, 9),
                              senderId: agentId,
                              receiverId: chatId,
                              text: text,
                              timestamp: new Date().toISOString(),
                              isAdmin: true // Agents count as admin/support in this context
                            };
                            
                            const updatedMessages = [...existingMessages, newMessage];
                            localStorage.setItem(`moneylink_chats_${chatId}`, JSON.stringify(updatedMessages));
                            
                            // Force re-render (in a real app, use state or context)
                            const event = new Event('storage');
                            window.dispatchEvent(event);
                            
                            input.value = '';
                            // Simple hack to force update for this demo since we're reading from localStorage directly in render
                            setSelectedUserForChat({...selectedUserForChat}); 
                          }
                        }}
                      />
                      <button className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <Headphones className="w-10 h-10 text-[#CCC]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#999]">Select a user to start support</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="h-[600px] p-4">
              <TaskManager role="agent" currentUser={agentId} />
            </div>
          )}

          {activeTab === 'meeting' && (
            <div className="h-[600px] relative">
              <LiveMeeting 
                userId={agentId}
                userName={currentAgent?.name || 'Agent'}
                onLeave={() => setActiveTab('users')}
              />
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingUser(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Edit User Details</h2>
                  <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-[#F0F0F0] rounded-xl">
                    <XCircle className="w-6 h-6 text-[#999]" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#999] uppercase ml-4">Full Name</label>
                    <input 
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-sm font-bold outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#999] uppercase ml-4">Phone Number</label>
                    <input 
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-sm font-bold outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-bold text-purple-700">Verification Status</span>
                    </div>
                    <button 
                      onClick={() => setEditingUser({ ...editingUser, isVerified: !editingUser.isVerified })}
                      className={`w-12 h-6 rounded-full transition-all relative ${editingUser.isVerified ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingUser.isVerified ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <button 
                    onClick={() => handleUpdateUser(editingUser)}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    SAVE_CHANGES
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <SupportChat currentUser={null} role="agent" config={config} />
        
        {/* Contact Info (Restricted) */}
        <div className="text-center space-y-2 pb-8 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Internal Contact</p>
          <div className="flex justify-center gap-4">
            <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="text-[10px] font-bold text-purple-600 hover:underline">derickmusiyalikeinstitution@gmail.com</a>
            <a href="https://wa.me/260774218141" className="text-[10px] font-bold text-purple-600 hover:underline">WhatsApp (+260 774218141)</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
