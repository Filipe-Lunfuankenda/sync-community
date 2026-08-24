import React from 'react';
import { MegaphoneIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface AnnouncementProps {
    id?: string;
    title: string;
    content: string;
    date: string;
    author: string;
}

export const AnnouncementCard: React.FC<AnnouncementProps> = ({ title, content, date, author }) => {
    return (
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 mb-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
                        <MegaphoneIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                        <p className="text-sm text-muted-foreground">
                            Por <span className="font-medium text-foreground">{author}</span> • {date}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-muted-foreground leading-relaxed">{content}</p>
            </div>
            <div className="mt-6 flex items-center space-x-4 border-t border-border pt-4">
                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Comentar</span>
                </button>
            </div>
        </div>
    );
};
