import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BellIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    type: string;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=50');
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await api.post('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                        <BellIcon className="w-8 h-8 text-primary" /> Central de Notificações
                    </h1>
                    <p className="text-muted-foreground">Fique por dentro de tudo o que acontece na sua comunidade.</p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button 
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold text-sm transition-all"
                    >
                        <CheckCircleIcon className="w-4 h-4" /> Marcar todas como lidas
                    </button>
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <BellIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium italic text-lg">Você não tem notificações no momento.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-6 transition-all relative hover:bg-accent/30 ${!n.is_read ? 'bg-primary/[0.03]' : ''}`}
                            >
                                {!n.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                                )}
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                            n.type === 'announcement' ? 'bg-blue-100 text-blue-600' : 
                                            n.type === 'poll' ? 'bg-emerald-100 text-emerald-600' : 
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {n.type === 'announcement' ? '📣' : n.type === 'poll' ? '📊' : '🔔'}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={`text-base font-bold ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {n.title}
                                            </h3>
                                            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground/60 font-medium">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: pt })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-muted-foreground/40 hover:text-destructive transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
