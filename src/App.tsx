import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import { 
  Home as HomeIcon, 
  Wallet, 
  CreditCard, 
  User as UserIcon, 
  Shield,
  Bell,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronLeft,
  FileText,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useZoom } from './contexts/ZoomContext';
import Home from './components/Home';
import LoanSection from './components/LoanSection';
import DigitalServices from './components/DigitalServices';
import AccountSection from './components/AccountSection';
import TrustSection from './components/TrustSection';
import TransactionsSection from './components/TransactionsSection';
import SettingsSection from './components/SettingsSection';
import HelpSection from './components/HelpSection';
import AdminPanel from './components/AdminPanel';
import DeveloperPanel from './components/DeveloperPanel';
import AgentPanel from './components/AgentPanel';
import SupportChat from './components/SupportChat';
import NetworkStatus from './components/NetworkStatus';
import LocationTracker from './components/LocationTracker';
import NotificationsPanel from './components/NotificationsPanel';
import AgentLogin from './components/AgentLogin';
import AIServicesSection from './components/AIServicesSection';
import TaxSection from './components/TaxSection';
import LockScreen from './components/LockScreen';
import VerticalScale from './components/VerticalScale';
import { Section, User, SystemConfig, AppNotification, Agent } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(() => {
    return (sessionStorage.getItem('moneylink_active_section') as Section) || 'home';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showAgentLogin, setShowAgentLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { zoom } = useZoom();
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('moneylink_is_locked') === 'true';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Persist state
  useEffect(() => {
    sessionStorage.setItem('moneylink_active_section', activeSection);
  }, [activeSection]);

  useEffect(() => {
    sessionStorage.setItem('moneylink_is_locked', String(isLocked));
  }, [isLocked]);

  // Prevent accidental reloads
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentUser) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // Idle Logout
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (currentUser && !isLocked) {
          setIsLocked(true);
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(idleTimer);
    };
  }, [currentUser, isLocked]);

  const lockSession = () => {
    setIsLocked(true);
  };

  const unlockSession = () => {
    setIsLocked(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPartner = params.get('mode') === 'dmi';
    
    if (isPartner) {
      document.body.classList.add('partner-mode');
    } else {
      document.body.classList.remove('partner-mode');
    }

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

    const directLogin = localStorage.getItem('moneylink_admin_direct_login');
    if (directLogin === 'true') {
      setIsAdminMode(true);
      localStorage.removeItem('moneylink_admin_direct_login');
    }
    
    const directAgentLogin = localStorage.getItem('moneylink_agent_direct_login');
    if (directAgentLogin === 'true') {
      const agentId = localStorage.getItem('moneylink_current_agent_id');
      if (agentId) {
        fetchWithFallback(`/api/agents`)
          .then(agents => {
            const agent = agents.find((a: any) => a.id === agentId);
            if (agent) {
              handleAgentLogin(agent);
            }
          });
      }
      localStorage.removeItem('moneylink_agent_direct_login');
    }
    
    const savedUser = localStorage.getItem('moneylink_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      // Sync with backend to get latest balance/verification status
      fetchWithFallback(`/api/users`)
        .then(async (users) => {
          const latest = users.find((u: any) => u.id === user.id);
          if (latest) {
            setCurrentUser(latest);
            localStorage.setItem('moneylink_current_user', JSON.stringify(latest));
            
            // If user has an admin, fetch the admin's approved app name
            if (latest.adminId && !isPartner) {
              const adminData = await fetchWithFallback(`/api/admins/${latest.adminId}`, null);
              if (adminData && adminData.approvedAppName) {
                setConfig(prev => prev ? { ...prev, appName: adminData.approvedAppName } : prev);
              }
            }
          }
        });
    }
    const storedConfig = JSON.parse(localStorage.getItem('moneylink_config') || '{}');
    const defaultConfig: SystemConfig = {
      appName: isPartner ? 'DERICK MUSIYALIKE INSTITUTION (DMI)' : 'MoneyLink Financial',
      appLogo: isPartner 
        ? 'https://ui-avatars.com/api/?name=D+M+I&background=1e3a8a&color=fff&size=200&font-size=0.5&length=3&bold=true'
        : logo,
      aiPrompt: '',
      primaryColor: isPartner ? '#1e3a8a' : '#15803d',
      maintenanceMode: false,
      twoFactorEnabled: true,
      biometricEnabled: true,
      version: '1.0.0'
    };
    
    if (isPartner) {
      setConfig(defaultConfig);
    } else {
      setConfig({ ...defaultConfig, ...storedConfig });
    }

    // Check for system updates
    const checkUpdate = async () => {
      if (isPartner) return; // Skip updates in partner mode for now
      try {
        const res = await fetch('/api/system-config');
        if (!res.ok) return;
        
        const systemConfig = await res.json();
        
        if (systemConfig && Object.keys(systemConfig).length > 0) {
          // Sync backend config to local state
          setConfig(prev => ({ ...prev, ...systemConfig }));
          localStorage.setItem('moneylink_config', JSON.stringify(systemConfig));

          // Check for version update
          if (systemConfig.version && systemConfig.version !== localStorage.getItem('moneylink_last_version')) {
            setShowUpdateModal(true);
            localStorage.setItem('moneylink_last_version', systemConfig.version);
          }
        }
      } catch (e) {
        // Silently ignore network errors during background checks to prevent console noise
      }
    };
    checkUpdate();
    const updateInterval = setInterval(checkUpdate, 30000);
    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    // Load notifications
    if (currentUser) {
      const savedNotifications = JSON.parse(localStorage.getItem('moneylink_notifications') || '[]');
      setNotifications(savedNotifications.filter((n: AppNotification) => n.userId === currentUser.id));
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('moneylink_current_user', JSON.stringify(user));
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    setIsAgentMode(false);
    setIsDeveloperMode(false);
    setActiveSection('home');
  };

  const handleAgentLogin = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsAgentMode(true);
    setIsAdminMode(false);
    setIsDeveloperMode(false);
    setActiveSection('agent');
    setShowAgentLogin(false);
  };

  const handleDeveloperLogin = () => {
    setIsDeveloperMode(true);
    setIsAdminMode(false);
    setIsAgentMode(false);
    setActiveSection('developer');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentAgent(null);
    setIsAdminMode(false);
    setIsAgentMode(false);
    setIsDeveloperMode(false);
    localStorage.removeItem('moneylink_current_user');
    setNotifications([]);
    setActiveSection('home');
    setIsMenuOpen(false);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem('moneylink_notifications') || '[]');
    const final = allNotifications.map((n: AppNotification) => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem('moneylink_notifications', JSON.stringify(final));
  };

  const clearAllNotifications = () => {
    if (!currentUser) return;
    const allNotifications = JSON.parse(localStorage.getItem('moneylink_notifications') || '[]');
    const final = allNotifications.filter((n: AppNotification) => n.userId !== currentUser.id);
    localStorage.setItem('moneylink_notifications', JSON.stringify(final));
    setNotifications([]);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <Home 
            onNavigate={setActiveSection} 
            currentUser={currentUser}
            onRegister={handleLogin}
            onLogin={handleLogin}
            onAdminLogin={handleAdminLogin}
            onAgentLogin={() => setShowAgentLogin(true)}
            onLogout={handleLogout}
            config={config}
          />
        );
      case 'apply-loan':
      case 'my-loans':
        return <LoanSection onBack={() => setActiveSection('home')} isRegistered={!!currentUser} config={config} />;
      case 'digital-services':
        return <DigitalServices onBack={() => setActiveSection('home')} currentUser={currentUser} onUpdateUser={handleLogin} config={config} onNavigate={setActiveSection} />;
      case 'account':
        return <AccountSection onBack={() => setActiveSection('home')} onLogout={handleLogout} currentUser={currentUser} onNavigate={setActiveSection} config={config} />;
      case 'trust':
        return <TrustSection onBack={() => setActiveSection('home')} config={config} />;
      case 'transactions':
        return <TransactionsSection onBack={() => setActiveSection('home')} currentUser={currentUser} />;
      case 'settings':
        return <SettingsSection onBack={() => setActiveSection('home')} onNavigate={setActiveSection} onDeveloperLogin={handleDeveloperLogin} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'help':
        return <HelpSection onBack={() => setActiveSection('home')} />;
      case 'ai-lab':
        return <AIServicesSection 
          onBack={() => setActiveSection('home')} 
          config={config} 
          role={isDeveloperMode ? 'developer' : isAdminMode ? 'admin' : 'user'}
        />;
      case 'tax':
        return <TaxSection currentUser={currentUser} />;
      case 'developer':
        return <DeveloperPanel 
          onBack={() => setActiveSection('home')}
          onLogout={() => {
            setIsDeveloperMode(false);
            setActiveSection('account');
          }} 
        />;
      case 'agent':
        return <AgentPanel 
          onBack={() => setActiveSection('home')}
          onLogout={() => {
            setIsAgentMode(false);
            setCurrentAgent(null);
            setActiveSection('home');
          }} 
          agentId={currentAgent?.id || ''} 
          isDeveloper={isDeveloperMode} 
        />;
      default:
        return <Home 
          onNavigate={setActiveSection} 
          currentUser={currentUser} 
          onRegister={handleLogin} 
          onLogin={handleLogin} 
          onAdminLogin={handleAdminLogin} 
          onAgentLogin={() => setShowAgentLogin(true)}
          onLogout={handleLogout} 
          config={config}
        />;
    }
  };

  if (isAdminMode) {
    return (
      <div>
        <AdminPanel 
          onBack={() => setIsAdminMode(false)}
          onLogout={() => setIsAdminMode(false)} 
          isDeveloper={isDeveloperMode} 
        />
      </div>
    );
  }

  if (isAgentMode) {
    return (
      <div>
        <AgentPanel 
          onBack={() => setIsAgentMode(false)}
          onLogout={() => {
            setIsAgentMode(false);
            setCurrentAgent(null);
          }} 
          agentId={currentAgent?.id || ''} 
        />
      </div>
    );
  }

  if (showSplash || !config) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-green-700 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(21,128,61,0.5)] mb-6 overflow-hidden border border-green-600/50">
            <img 
              src={config?.appLogo || logo} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-white tracking-tighter"
          >
            {config?.appName || 'MoneyLink Financial'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-green-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2"
          >
            Financial Freedom
          </motion.p>
        </motion.div>

        {/* Loading Bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full h-full bg-green-700"
          />
        </div>

        {/* Developer Credit */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em]">Developed By</p>
          <p className="text-[10px] text-white/50 font-black">DMI GROUP</p>
        </motion.div>

        {/* Decorative Background */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-700/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-900/20 rounded-full blur-[120px]"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'apply-loan', label: 'Loans', icon: Wallet },
    { id: 'digital-services', label: 'Services', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'trust', label: 'Trust', icon: Shield },
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai-lab', label: 'AI Lab', icon: Sparkles },
    { id: 'tax', label: 'Tax', icon: Calculator },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'} font-sans selection:bg-green-100 selection:text-green-900`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-[#F0F0F0]'} backdrop-blur-md z-50 border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeSection !== 'home' && (
              <button 
                onClick={() => setActiveSection('home')}
                className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveSection('home')}
            >
              <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-700/20 overflow-hidden">
                <img 
                  src={config.appLogo} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = logo;
                  }}
                />
              </div>
              <span className="font-black text-xl tracking-tighter">{config.appName || 'MoneyLink Financial'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
                        <NetworkStatus />
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[#666]" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isDeveloperMode && (
                  <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-xl border border-blue-100">
                    <button 
                      onClick={() => setIsAdminMode(true)}
                      className="px-2 py-1 text-[8px] font-bold text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      ADMIN
                    </button>
                    <button 
                      onClick={() => setIsAgentMode(true)}
                      className="px-2 py-1 text-[8px] font-bold text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      AGENT
                    </button>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdminMode(true)}
                className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <Settings className="w-5 h-5 text-[#999]" />
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#666]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
          >
            <nav className="space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 py-4 border-b border-[#F0F0F0] text-lg font-semibold"
                >
                  <item.icon className={`w-6 h-6 ${activeSection === item.id ? 'text-green-700' : 'text-[#999]'}`} />
                  <span className={activeSection === item.id ? 'text-green-700' : 'text-[#1A1A1A]'}>{item.label}</span>
                </button>
              ))}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 py-4 border-b border-[#F0F0F0] text-lg font-semibold text-red-600"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <VerticalScale />

      {/* Main Content */}
      <main className={`w-full max-w-[1920px] mx-auto pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Global Developer Credit */}
        <div className="mt-12 mb-8 text-center space-y-3 opacity-50 hover:opacity-100 transition-opacity">
          <p className={`text-[9px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-[#999]'} uppercase tracking-[0.3em]`}>Official Developer</p>
          <div className="space-y-0.5">
            <p className={`text-[11px] font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>DMI GROUP</p>
            <p className={`text-[9px] ${isDarkMode ? 'text-gray-500' : 'text-[#666]'} font-bold`}>Lusaka, Zambia</p>
          </div>
          <div className="flex justify-center gap-4">
            <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="text-[9px] font-bold text-green-700 hover:underline">EMAIL</a>
            <a href="https://wa.me/260774218141" className="text-[9px] font-bold text-green-700 hover:underline">WHATSAPP</a>
          </div>
        </div>
      </main>

      {/* Support Chat */}
      {activeSection !== 'developer' && config && <SupportChat currentUser={currentUser} config={config} />}

      {/* Location Tracker */}
      {config && <LocationTracker currentUser={currentUser} config={config} />}

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onClearAll={clearAllNotifications}
      />

      {/* Agent Login Modal */}
      <AnimatePresence>
        {showAgentLogin && (
          <AgentLogin 
            onLogin={handleAgentLogin}
            onCancel={() => setShowAgentLogin(false)}
          />
        )}
      </AnimatePresence>

      {/* System Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-10 h-10 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter">System Update</h2>
                <p className="text-sm text-[#666]">A new version of {config?.appName} is available. Please update to continue using the latest features.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
              >
                UPDATE_NOW
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lock Screen */}
      <AnimatePresence>
        {isLocked && config && (
          <LockScreen appName={config.appName} onUnlock={unlockSession} />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#F0F0F0] z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {navItems.map((item) => (
            <NavButton 
              key={item.id}
              active={activeSection === item.id || (item.id === 'apply-loan' && activeSection === 'my-loans')} 
              icon={item.icon} 
              label={item.label} 
              onClick={() => setActiveSection(item.id as Section)} 
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps & { isDarkMode: boolean }> = ({ active, icon: Icon, label, onClick, isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all relative group ${active ? 'text-green-700' : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-[#999] hover:text-[#666]'}`}
  >
    <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-green-700 text-white shadow-lg shadow-green-700/20 scale-110' 
        : isDarkMode ? 'bg-transparent group-hover:bg-gray-800 group-hover:scale-105' : 'bg-transparent group-hover:bg-[#F0F0F0] group-hover:scale-105'
    }`}>
      <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
      active ? 'opacity-100 translate-y-0' : 'opacity-40 group-hover:opacity-70'
    }`}>
      {label}
    </span>
    {active && (
      <motion.div 
        layoutId="nav-indicator"
        className="absolute -bottom-4 w-1 h-1 bg-green-700 rounded-full"
      />
    )}
  </button>
);

export default App;
