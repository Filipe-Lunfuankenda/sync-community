import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n: Notification) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    return (
        <Popover className="relative">
            <PopoverButton className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all relative outline-none">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background">
                        {unreadCount}
                    </span>
                )}
            </PopoverButton>

            <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <PopoverPanel className="absolute right-0 z-50 mt-3 w-80 transform px-4 sm:px-0">
                    <div className="overflow-hidden rounded-xl shadow-2xl border border-border bg-card ring-1 ring-black/5">
                        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                            {unreadCount > 0 && (
                                <button className="text-[10px] uppercase tracking-wider font-bold text-primary hover:underline">
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-muted-foreground italic">Sem notificações novas</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer relative ${!notification.is_read ? 'bg-primary/5' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-foreground line-clamp-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: pt })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-muted/30 border-t border-border text-center">
                            <Link 
                                to="/notifications" 
                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                Ver todas as notificações
                            </Link>
                        </div>
                    </div>
                </PopoverPanel>
            </Transition>
        </Popover>
    );
};
