import React from 'react';
import { ProcessCard } from '../components/Workflow/ProcessCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateProcessModal } from '../components/Workflow/CreateProcessModal';



export const WorkflowBoard: React.FC = () => {
    const { currentOrg } = useAuth();
    const [instances, setInstances] = React.useState<any[]>([]);
    const [areas, setAreas] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        if (!currentOrg) return;
        setLoading(true);
        try {
            const [instancesRes, areasRes] = await Promise.all([
                api.get('/workflows/instances'),
                api.get('/management')
            ]);
            setInstances(instancesRes.data);
            setAreas(areasRes.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch workflow instances", err);
            setError("Não foi possível carregar os processos.");
        } finally {
            setLoading(false);
        }
    }, [currentOrg]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const pendingReview = instances.filter(i => i.status === 'pending' || i.status === 'in_review');
    const completed = instances.filter(i => i.status === 'approved' || i.status === 'rejected' || i.status === 'archived');

    return (
        <div className="max-w-7xl mx-auto py-8 lg:py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Motor de Processos</h1>
                    <p className="text-base text-muted-foreground mt-1 font-medium">Gira os pedidos e aprovações da sua equipa em tempo real.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2.5 bg-primary text-primary-foreground border border-transparent rounded-lg text-sm font-semibold hover:bg-primary/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <PlusIcon className="w-5 h-5 mr-1.5 -ml-1" />
                    Novo Processo
                </button>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-8 text-center font-medium">
                    {error}
                </div>
            )}

            {/* Premium Kanban Board Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Column: A Aguardar */}
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg border border-border p-5 min-h-[500px] shadow-sm">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-warning"></div> A Aguardar
                        </span>
                        <span className="bg-card border border-border text-foreground py-0.5 px-2.5 rounded-md text-xs font-bold shadow-sm">{pendingReview.length}</span>
                    </h2>
                    <div className="space-y-4">
                        {pendingReview.map(p => (
                            <div key={p.id} className="transition-transform hover:-translate-y-1 duration-200">
                                <ProcessCard
                                    id={p.id}
                                    title={p.title}
                                    templateName={p.template_name}
                                    requesterName={p.requester_name || "Membro"}
                                    status={p.status}
                                    date={new Date(p.created_at).toLocaleString()}
                                    currentStepOrder={1}
                                    managementAreaName={p.management_area_id ? areas.find(a => a.id === p.management_area_id)?.name || 'Geral' : 'Geral'}
                                    logsCount={p.logs?.length || 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column: Concluídos */}
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg border border-border p-5 min-h-[500px] shadow-sm">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success"></div> Concluídos
                        </span>
                        <span className="bg-card border border-border text-foreground py-0.5 px-2.5 rounded-md text-xs font-bold shadow-sm">{completed.length}</span>
                    </h2>
                    <div className="space-y-4">
                        {completed.map(p => (
                            <div key={p.id} className="transition-transform hover:-translate-y-1 duration-200">
                                <ProcessCard
                                    id={p.id}
                                    title={p.title}
                                    templateName={p.template_name}
                                    requesterName={p.requester_name || "Membro"}
                                    status={p.status}
                                    date={new Date(p.created_at).toLocaleString()}
                                    currentStepOrder={1}
                                    managementAreaName={p.management_area_id ? areas.find(a => a.id === p.management_area_id)?.name || 'Geral' : 'Geral'}
                                    logsCount={p.logs?.length || 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder Column */}
                <div className="bg-background/40 rounded-lg border-2 border-dashed border-border p-5 flex flex-col items-center justify-center min-h-[500px] hover:bg-muted/50 transition-colors cursor-pointer group">
                    <PlusIcon className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors duration-200" />
                    <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-200">Adicionar Coluna</p>
                </div>

            </div>

            <CreateProcessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </div>
    );
};
