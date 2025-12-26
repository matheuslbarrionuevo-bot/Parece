
import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { AppNotification } from '../types';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: AppNotification = { id, title, message, type, timestamp: new Date() };
    
    setNotifications(prev => [newNotif, ...prev].slice(0, 3));

    // Notificação Nativa do Navegador
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }

    // Auto-remover após 5 segundos
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  useEffect(() => {
    // Solicitar permissão para notificações nativas
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Expor função globalmente para simulação simples entre componentes
    (window as any).notify = addNotification;
  }, [addNotification]);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className="pointer-events-auto animate-in slide-in-from-right duration-300 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 flex gap-3 group overflow-hidden relative"
        >
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600/20 w-full">
            <div className="h-full bg-blue-600 animate-[shrink_5s_linear_forwards]" style={{ width: '100%' }}></div>
          </div>
          
          <div className={`mt-0.5 shrink-0 ${
            n.type === 'success' ? 'text-green-500' : 
            n.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
          }`}>
            {n.type === 'success' ? <CheckCircle size={20} /> : 
             n.type === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-slate-900 leading-tight">{n.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
          </div>
          
          <button 
            onClick={() => removeNotification(n.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
