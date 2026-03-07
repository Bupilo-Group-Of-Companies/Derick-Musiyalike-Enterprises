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
import { User, ChatMessage, Agent, SystemConfig, Task } from '../types';
import SupportChat from './SupportChat';
import LiveMeeting from './LiveMeeting';
import ZoomControl from './ZoomControl';

interface AgentPanelProps {
  onLogout: () => void;
  agentId: string;
  isDeveloper?: boolean;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ onLogout, agentId, isDeveloper }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'tasks' | 'meeting' | 'storage'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('moneylink_agent_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      const updated = [term.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('moneylink_agent_recent_searches', JSON.stringify(updated));
    }
  };
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [files, setFiles] = useState<{ id: string, name: string, size: string, type: string, date: string, content?: string, folderId?: string | null }[]>([]);
  const [folders, setFolders] = useState<{ id: string, name: string, parentId: string | null }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
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
      
      const storedFiles = JSON.parse(localStorage.getItem('moneylink_agent_files') || '[]');
      setFiles(storedFiles);
      const storedFolders = JSON.parse(localStorage.getItem('moneylink_agent_folders') || '[]');
      setFolders(storedFolders);
    };
    
    fetchData();
  }, [agentId]);

  const createFolder = (name: string) => {
    const newFolder = { id: Math.random().toString(36).substr(2, 9), name, parentId: currentFolderId };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('moneylink_agent_folders', JSON.stringify(updatedFolders));
  };

  const deleteFolder = (id: string) => {
    const updatedFolders = folders.filter(f => f.id !== id);
    setFolders(updatedFolders);
    localStorage.setItem('moneylink_agent_folders', JSON.stringify(updatedFolders));
    const updatedFiles = files.filter(f => f.folderId !== id);
    setFiles(updatedFiles);
    localStorage.setItem('moneylink_agent_files', JSON.stringify(updatedFiles));
  };

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
        content: event.target?.result as string,
        folderId: currentFolderId
      };
      const updatedFiles = [newFile, ...files];
      setFiles(updatedFiles);
      localStorage.setItem('moneylink_agent_files', JSON.stringify(updatedFiles));
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem('moneylink_agent_files', JSON.stringify(updatedFiles));
  };

  const downloadFile = (file: any) => {
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    a.click();
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
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'storage' ? 'bg-white shadow-sm text-purple-600' : 'text-[#666]'
            }`}
          >
            <FileText className="w-4 h-4" />
            STORAGE
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
                    onFocus={() => setShowRecentSearches(true)}
                    onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchTerm);
                        setShowRecentSearches(false);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                  {showRecentSearches && recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E5E5E5] rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-2 bg-[#F8F9FA] border-b border-[#E5E5E5] text-[10px] font-bold text-[#999] flex justify-between items-center">
                        RECENT SEARCHES
                        <button 
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem('moneylink_agent_recent_searches');
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchTerm(term);
                            setShowRecentSearches(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-[#F8F9FA] transition-colors flex items-center gap-2"
                        >
                          <Search className="w-3 h-3 text-[#999]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
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
                        id="agent-chat-input"
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
                      <button 
                        onClick={() => {
                          const input = document.getElementById('agent-chat-input') as HTMLInputElement;
                          if (input) {
                            const event = new KeyboardEvent('keydown', { key: 'Enter' });
                            input.dispatchEvent(event);
                            // Or just duplicate the logic
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
                              isAdmin: true
                            };
                            
                            const updatedMessages = [...existingMessages, newMessage];
                            localStorage.setItem(`moneylink_chats_${chatId}`, JSON.stringify(updatedMessages));
                            
                            const storageEvent = new Event('storage');
                            window.dispatchEvent(storageEvent);
                            
                            input.value = '';
                            setSelectedUserForChat({...selectedUserForChat}); 
                          }
                        }}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                      >
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
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Tasks</h3>
                <button 
                  onClick={() => {
                    const title = prompt('Task title:');
                    if (title) {
                      const priority = prompt('Priority (low, medium, high):') as 'low' | 'medium' | 'high' || 'medium';
                      const newTask: Task = {
                        id: Math.random().toString(36).substr(2, 9),
                        title,
                        description: '',
                        priority,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                      };
                      setTasks([...tasks, newTask]);
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center text-[#999] py-12">No tasks yet.</div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-2xl border border-[#F0F0F0] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{task.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
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

          {activeTab === 'storage' && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Agent Storage {currentFolderId && `> ${folders.find(f => f.id === currentFolderId)?.name}`}</h2>
                <div className="flex gap-2">
                  {currentFolderId && (
                    <button 
                      onClick={() => setCurrentFolderId(folders.find(f => f.id === currentFolderId)?.parentId || null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      BACK
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const name = prompt('Folder name:');
                      if (name) createFolder(name);
                    }}
                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs hover:bg-purple-100 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> NEW_FOLDER
                  </button>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-purple-700 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> UPLOAD_FILE
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {folders.filter(f => f.parentId === currentFolderId).map(folder => (
                  <div key={folder.id} className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm group relative flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-all" onClick={() => setCurrentFolderId(folder.id)}>
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="font-bold text-sm truncate">{folder.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="absolute top-2 right-2 p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {files.filter(f => f.folderId === currentFolderId).map(file => (
                  <div key={file.id} className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm group relative flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="font-bold text-sm truncate w-full text-center">{file.name}</p>
                    <p className="text-xs text-[#666] mt-1">{file.size} • {file.date}</p>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => downloadFile(file)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteFile(file.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {files.filter(f => f.folderId === currentFolderId).length === 0 && folders.filter(f => f.parentId === currentFolderId).length === 0 && (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 py-12 text-center border-2 border-dashed border-[#E5E5E5] rounded-[2rem]">
                    <FileText className="w-12 h-12 text-[#CCC] mx-auto mb-4" />
                    <p className="text-sm font-bold text-[#999]">No files or folders in this location</p>
                  </div>
                )}
              </div>
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
        <ZoomControl />
      </div>
    </div>
  );
};

export default AgentPanel;
