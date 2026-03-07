import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, CheckCircle, XCircle, Clock, FileText, ArrowLeft } from 'lucide-react';
import { Role, AIPublishRequest } from '../types';
import { generateAIResponse } from '../services/aiService';

interface AILabProps {
  currentUser: any;
  role: Role;
  onBack?: () => void;
}

const AILab: React.FC<AILabProps> = ({ currentUser, role, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [requests, setRequests] = useState<AIPublishRequest[]>([]);

  useEffect(() => {
    const fetchRequests = () => {
      const stored = JSON.parse(localStorage.getItem('moneylink_ai_publish_requests') || '[]');
      if (role === 'developer') {
        setRequests(stored);
      } else {
        setRequests(stored.filter((r: AIPublishRequest) => r.requesterId === currentUser?.id));
      }
    };
    fetchRequests();
  }, [role, currentUser]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await generateAIResponse(prompt);
      setGeneratedContent(response);
    } catch (error) {
      console.error('Failed to generate content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishRequest = () => {
    if (!generatedContent || !title) return;

    const newRequest: AIPublishRequest = {
      id: Date.now().toString(),
      requesterId: currentUser?.id || 'unknown',
      requesterRole: role,
      content: generatedContent,
      title,
      status: role === 'developer' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      ...(role === 'developer' && { publishedAt: new Date().toISOString() })
    };

    const stored = JSON.parse(localStorage.getItem('moneylink_ai_publish_requests') || '[]');
    const updated = [newRequest, ...stored];
    localStorage.setItem('moneylink_ai_publish_requests', JSON.stringify(updated));
    
    if (role === 'developer') {
      // Also publish immediately
      const published = JSON.parse(localStorage.getItem('moneylink_published_ai_content') || '[]');
      localStorage.setItem('moneylink_published_ai_content', JSON.stringify([newRequest, ...published]));
      alert('Content published successfully!');
    } else {
      alert('Publish request submitted to Developer for approval.');
    }
    
    setRequests(role === 'developer' ? updated : updated.filter((r: AIPublishRequest) => r.requesterId === currentUser?.id));
    setPrompt('');
    setGeneratedContent('');
    setTitle('');
  };

  const handleApprove = (id: string) => {
    const stored = JSON.parse(localStorage.getItem('moneylink_ai_publish_requests') || '[]');
    const request = stored.find((r: AIPublishRequest) => r.id === id);
    if (!request) return;

    const updatedRequest = { ...request, status: 'approved', publishedAt: new Date().toISOString() };
    const updated = stored.map((r: AIPublishRequest) => r.id === id ? updatedRequest : r);
    localStorage.setItem('moneylink_ai_publish_requests', JSON.stringify(updated));
    
    const published = JSON.parse(localStorage.getItem('moneylink_published_ai_content') || '[]');
    localStorage.setItem('moneylink_published_ai_content', JSON.stringify([updatedRequest, ...published]));
    
    setRequests(updated);
    alert('Content approved and published!');
  };

  const handleReject = (id: string) => {
    const stored = JSON.parse(localStorage.getItem('moneylink_ai_publish_requests') || '[]');
    const updated = stored.map((r: AIPublishRequest) => r.id === id ? { ...r, status: 'rejected' } : r);
    localStorage.setItem('moneylink_ai_publish_requests', JSON.stringify(updated));
    setRequests(updated);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Lab</h1>
          <p className="text-[#666] text-sm">Generate and publish content using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold">Content Generator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#666] mb-2 uppercase tracking-widest">Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter content title..."
                className="w-full bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666] mb-2 uppercase tracking-widest">AI Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like the AI to write about?"
                rows={4}
                className="w-full bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-600 resize-none"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  GENERATE_CONTENT
                </>
              )}
            </button>
          </div>

          {generatedContent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-[#F0F0F0]"
            >
              <label className="block text-xs font-bold text-[#666] uppercase tracking-widest">Generated Content</label>
              <div className="p-4 bg-[#F8F9FA] rounded-xl text-sm whitespace-pre-wrap border border-[#E5E5E5]">
                {generatedContent}
              </div>
              
              <button 
                onClick={handlePublishRequest}
                disabled={!title}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Send className="w-5 h-5" />
                {role === 'developer' ? 'PUBLISH_NOW' : 'REQUEST_PUBLISH'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Requests/History Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">
              {role === 'developer' ? 'Publish Requests' : 'My Requests'}
            </h2>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-[#999]">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No publish requests found.</p>
              </div>
            ) : (
              requests.map(request => (
                <div key={request.id} className="p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm">{request.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  {role === 'developer' && (
                    <div className="text-[10px] text-[#666] flex gap-4">
                      <span>By: {request.requesterRole} ({request.requesterId})</span>
                      <span>Date: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="text-xs text-[#666] line-clamp-3 bg-white p-3 rounded-xl border border-[#E5E5E5]">
                    {request.content}
                  </div>

                  {role === 'developer' && request.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        APPROVE
                      </button>
                      <button 
                        onClick={() => handleReject(request.id)}
                        className="flex-1 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        REJECT
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILab;
