import React from 'react';
import {
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

type ProcessState = 'pending' | 'in_review' | 'approved' | 'rejected' | 'archived';

interface ProcessInstanceProps {
    id: string;
    title: string;
    templateName: string;
    requesterName: string;
    status: ProcessState;
    date: string;
    currentStepOrder: number;
    managementAreaName?: string;
    logsCount?: number;
}

const getStatusConfig = (status: ProcessState) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-warning/20 text-warning', icon: ClockIcon, label: 'Pendente' };
        case 'in_review':
            return { color: 'bg-accent text-accent-foreground', icon: DocumentTextIcon, label: 'Em Revisão' };
        case 'approved':
            return { color: 'bg-success/20 text-success', icon: CheckCircleIcon, label: 'Aprovado' };
        case 'rejected':
            return { color: 'bg-destructive/20 text-destructive', icon: XCircleIcon, label: 'Rejeitado' };
        case 'archived':
            return { color: 'bg-muted text-muted-foreground', icon: ArchiveBoxIcon, label: 'Arquivado' };
    }
};

export const ProcessCard: React.FC<ProcessInstanceProps> = ({
    title, templateName, requesterName, status, date, currentStepOrder, managementAreaName
}) => {
    const config = getStatusConfig(status);
    const StatusIcon = config.icon;

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="pr-2 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest px-1.5 py-0.5 bg-muted rounded border border-border/30">
                            {templateName}
                        </span>
                        {managementAreaName && (
                            <span className="text-[10px] font-extrabold text-primary/80 uppercase tracking-widest px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                                {managementAreaName}
                            </span>
                        )}
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1.5 leading-tight">{title}</h3>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {config.label}
                </span>
            </div>

            <div className="flex items-end justify-between mt-6">
                <div>
                    <p className="text-sm font-medium text-foreground">{requesterName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
                </div>
                {(status === 'pending' || status === 'in_review') && (
                    <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
                        Passo {currentStepOrder}
                    </div>
                )}
            </div>
        </div>
    );
};
