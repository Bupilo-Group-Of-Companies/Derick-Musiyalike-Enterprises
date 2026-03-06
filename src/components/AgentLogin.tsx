import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Headphones, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Agent } from '../types';

interface AgentLoginProps {
  onLogin: (agent: Agent) => void;
  onCancel: () => void;
}

const AgentLogin: React.FC<AgentLoginProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'request'>('login');
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [requestData, setRequestData] = useState({ name: '', phone: '', email: '', adminId: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agents');
      const agents: Agent[] = await res.json();
      const agent = agents.find(a => a.id === agentId && (a.password === password || !a.password)); // Allow no password for legacy/dev
      
      if (agent) {
        if (agent.status !== 'active') {
          alert('Your account is inactive. Please contact your administrator.');
        } else {
          onLogin(agent);
        }
      } else {
        alert('Invalid Agent ID or Password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!requestData.name || !requestData.phone || !requestData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await fetch('/api/agent-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });
      alert('Request submitted! You will be notified when an admin approves your account.');
      setMode('login');
    } catch (error) {
      console.error('Request failed:', error);
      alert('Failed to submit request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <XCircle className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-purple-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-purple-600/30 mb-4">
            <Headphones className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {mode === 'login' ? 'Agent Portal' : 'Join the Team'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'login' ? 'Secure access for support staff' : 'Submit your application'}
          </p>
        </div>

        {mode === 'login' ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Agent ID</label>
              <input 
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-purple-600 focus:bg-white transition-all"
                placeholder="Enter your Agent ID"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-purple-600 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Authenticating...' : 'Access Portal'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-4 text-center">
              <button 
                onClick={() => setMode('request')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
              >
                Request Access Account
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                <input 
                  type="text"
                  value={requestData.name}
                  onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Phone</label>
                <input 
                  type="text"
                  value={requestData.phone}
                  onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-600"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
              <input 
                type="email"
                value={requestData.email}
                onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Admin ID (Optional)</label>
              <input 
                type="text"
                value={requestData.adminId}
                onChange={(e) => setRequestData({ ...requestData, adminId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-purple-600"
                placeholder="If invited by an admin"
              />
            </div>

            <button 
              onClick={handleRequest}
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
              {!isLoading && <CheckCircle className="w-4 h-4" />}
            </button>

            <div className="pt-4 text-center">
              <button 
                onClick={() => setMode('login')}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AgentLogin;
