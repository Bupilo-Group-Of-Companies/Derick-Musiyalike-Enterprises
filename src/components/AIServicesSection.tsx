import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Mic, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  MapPin, 
  Send, 
  Play, 
  Download, 
  Loader2, 
  Volume2,
  Camera,
  Wand2,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { 
  generateThinkingResponse, 
  generateSpeech, 
  analyzeVideo, 
  analyzeImage, 
  transcribeAudio, 
  generateVideo, 
  generateImageWithAspectRatio, 
  animateImageWithVeo, 
  editImageWithText, 
  getMapsGroundingResponse 
} from '../services/aiService';
import { GoogleGenAI, Modality } from "@google/genai";

interface AIServicesSectionProps {
  onBack: () => void;
  config: any;
  role: 'user' | 'admin' | 'developer';
}

const AIServicesSection: React.FC<AIServicesSectionProps> = ({ onBack, config, role }) => {
  const [activeTab, setActiveTab] = useState<'thinking' | 'voice' | 'media' | 'creator' | 'maps'>('thinking');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTabs = [
    { id: 'thinking', label: 'Thinking', icon: Brain, roles: ['user', 'admin', 'developer'] },
    { id: 'voice', label: 'Voice', icon: Mic, roles: ['admin', 'developer'] },
    { id: 'media', label: 'Media', icon: Video, roles: ['admin', 'developer'] },
    { id: 'creator', label: 'Creator', icon: Sparkles, roles: ['developer'] },
    { id: 'maps', label: 'Maps', icon: MapPin, roles: ['developer'] },
  ].filter(tab => tab.roles.includes(role));

  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id as any || 'thinking');
    }
  }, [role]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFile(reader.result as string);
        if (file.type.startsWith('image/')) setMediaType('image');
        else if (file.type.startsWith('video/')) setMediaType('video');
        else if (file.type.startsWith('audio/')) setMediaType('audio');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (role !== 'developer') return;
    setIsLoading(true);
    try {
      // Simulate publishing
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("AI Model Published Successfully to Production!");
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async () => {
    if (!prompt && !mediaFile) return;
    setIsLoading(true);
    setResponse(null);
    setAudioUrl(null);

    try {
      let result;
      const base64Data = mediaFile?.split(',')[1] || '';
      const mimeType = mediaFile?.split(';')[0].split(':')[1] || '';

      switch (activeTab) {
        case 'thinking':
          result = await generateThinkingResponse(prompt);
          setResponse(result);
          break;
        case 'voice':
          const ttsData = await generateSpeech(prompt);
          if (ttsData) {
            const blob = await (await fetch(`data:audio/wav;base64,${ttsData}`)).blob();
            setAudioUrl(URL.createObjectURL(blob));
          }
          setResponse("Voice response generated.");
          break;
        case 'media':
          if (mediaType === 'video') {
            result = await analyzeVideo(prompt, base64Data, mimeType);
          } else if (mediaType === 'image') {
            if (role === 'admin') {
              setResponse("Admins can only analyze video in this section.");
              return;
            }
            result = await analyzeImage(prompt, base64Data, mimeType);
          } else if (mediaType === 'audio') {
            if (role === 'admin') {
              setResponse("Admins can only analyze video in this section.");
              return;
            }
            result = await transcribeAudio(base64Data, mimeType);
          }
          setResponse(result);
          break;
        case 'creator':
          if (role !== 'developer') return;
          if (mediaType === 'image') {
            result = await animateImageWithVeo(prompt, base64Data, mimeType, aspectRatio as any);
            setResponse({ type: 'video', url: result });
          } else if (prompt.toLowerCase().includes('edit')) {
            result = await editImageWithText(prompt, base64Data, mimeType);
            setResponse({ type: 'image', url: result });
          } else if (prompt.toLowerCase().includes('generate image')) {
            result = await generateImageWithAspectRatio(prompt, aspectRatio);
            setResponse({ type: 'image', url: result });
          } else {
            result = await generateVideo(prompt, aspectRatio as any);
            setResponse({ type: 'video', url: result });
          }
          break;
        case 'maps':
          if (role !== 'developer') return;
          let lat, lng;
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
            });
          }
          result = await getMapsGroundingResponse(prompt, lat, lng);
          setResponse(result);
          break;
      }
    } catch (error) {
      console.error("Action failed:", error);
      setResponse("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">{config.appName} AI LAB</h1>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                {role.toUpperCase()} ACCESS MODE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {role === 'developer' && (
              <button 
                onClick={handlePublish}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Publish Model
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setResponse(null);
                setMediaFile(null);
                setMediaType(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Input Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTab === 'thinking' ? "Ask a complex reasoning question..." :
                    activeTab === 'voice' ? "What would you like to talk about?" :
                    activeTab === 'media' ? "Describe what you want to find in the video..." :
                    activeTab === 'creator' ? "Describe the image or video to create..." :
                    "Find places or get map-based info..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[120px] resize-none"
                />
              </div>

              {(activeTab === 'media' || activeTab === 'creator') && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Media Attachment</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden relative"
                  >
                    {mediaFile ? (
                      mediaType === 'image' ? (
                        <img src={mediaFile} className="w-full h-full object-cover" alt="Preview" />
                      ) : mediaType === 'video' ? (
                        <video src={mediaFile} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Volume2 className="w-6 h-6" />
                          <span className="text-xs font-bold">Audio Loaded</span>
                        </div>
                      )
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {activeTab === 'media' && role === 'admin' ? 'Upload Video Only' : 'Upload Image, Video, or Audio'}
                        </p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept={activeTab === 'media' && role === 'admin' ? "video/*" : "image/*,video/*,audio/*"}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'creator' && role === 'developer' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                          aspectRatio === ratio 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={executeAction}
                disabled={isLoading || (!prompt && !mediaFile)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-white/5 disabled:text-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    EXECUTE AI TASK
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold tracking-tighter uppercase italic">Output Stream</h2>
                <div className="flex gap-2">
                  {response && role === 'developer' && (
                    <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <AnimatePresence mode="wait">
                  {!response && !isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20"
                    >
                      <Brain className="w-16 h-16" />
                      <p className="text-xs font-bold uppercase tracking-widest">Waiting for Input...</p>
                    </motion.div>
                  )}

                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full border-t-emerald-500 animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">AI is Thinking...</p>
                    </motion.div>
                  )}

                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {typeof response === 'string' ? (
                        <div className="prose prose-invert max-w-none">
                          <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{response}</p>
                        </div>
                      ) : response.type === 'image' ? (
                        <div className="rounded-2xl overflow-hidden border border-white/10">
                          <img src={response.url} className="w-full h-auto" alt="AI Generated" />
                        </div>
                      ) : response.type === 'video' ? (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                          <video src={response.url} controls className="w-full h-full" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed text-white/80">{response.text}</p>
                          {response.grounding && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sources & Locations</p>
                              <div className="grid grid-cols-1 gap-2">
                                {response.grounding.map((chunk: any, i: number) => (
                                  <a 
                                    key={i}
                                    href={chunk.maps?.uri || chunk.web?.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all"
                                  >
                                    <span className="text-xs font-bold text-emerald-400">{chunk.maps?.title || chunk.web?.title || 'View Source'}</span>
                                    <MapPin className="w-4 h-4 text-white/20" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {audioUrl && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Volume2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Audio Response</p>
                            <audio src={audioUrl} controls className="h-8 w-full mt-1" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Access Level', value: role.toUpperCase() },
            { label: 'Model', value: activeTab === 'thinking' ? 'Gemini 3.1 Pro' : 'Gemini 2.5 Flash' },
            { label: 'Security', value: 'Bank-grade' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</span>
              <span className="text-sm font-bold text-white mt-1">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIServicesSection;
