import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle, Info, MessageSquare, Wallet } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead,
  onClearAll 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Notifications</h2>
                  <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">
                    {notifications.filter(n => !n.isRead).length} Unread
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#999]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      notification.isRead ? 'bg-white border-[#F0F0F0]' : 'bg-green-50/50 border-green-100 shadow-sm'
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notification.type === 'loan' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'chat' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {notification.type === 'loan' && <Wallet className="w-4 h-4" />}
                        {notification.type === 'chat' && <MessageSquare className="w-4 h-4" />}
                        {notification.type === 'system' && <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{notification.title}</h4>
                          <span className="text-[8px] text-[#999] font-bold whitespace-nowrap ml-2">{notification.date}</span>
                        </div>
                        <p className="text-[11px] text-[#666] leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 text-[#CCC]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">No notifications yet</p>
                    <p className="text-xs text-[#999] mt-1">We'll notify you when something important happens.</p>
                  </div>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-[#F0F0F0] bg-[#F8F9FA]">
                <button 
                  onClick={onClearAll}
                  className="w-full py-3 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] hover:bg-red-50 rounded-xl transition-all"
                >
                  Clear All Notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
