import React from 'react';
import { AnnouncementCard } from '../components/Communication/AnnouncementCard';
import { PollCard } from '../components/Communication/PollCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateAnnouncementModal } from '../components/Communication/CreateAnnouncementModal';
import { CreatePollModal } from '../components/Communication/CreatePollModal';

export const CommunicationFeed: React.FC = () => {
    const { currentOrg, userRole } = useAuth();
    const canCreate = userRole === 'Admin' || userRole === 'Manager';
    const [announcements, setAnnouncements] = React.useState<any[]>([]);
    const [polls, setPolls] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isAnnModalOpen, setIsAnnModalOpen] = React.useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        if (!currentOrg) return;
        setLoading(true);
        try {
            const [annResponse, pollResponse] = await Promise.all([
                api.get('/communication/announcements'),
                api.get('/communication/polls')
            ]);
            setAnnouncements(annResponse.data);
            setPolls(pollResponse.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch feed data", err);
            setError("Erro ao carregar o feed. Tente novamente mais tarde.");
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

    // Mix and sort items by date (mocking a timeline)
    const combinedFeed = [
        ...announcements.map(a => ({ ...a, type: 'announcement' })),
        ...polls.map(p => ({ ...p, type: 'poll' }))
    ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return (
        <div className="max-w-3xl mx-auto py-8 lg:py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Comunicação Interna</h1>
                    <p className="text-base text-muted-foreground mt-1 font-medium">Anúncios e votações da sua organização.</p>
                </div>
                {canCreate && (
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsPollModalOpen(true)}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 bg-background border border-input rounded-lg text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200"
                        >
                            Nova Votação
                        </button>
                        <button 
                            onClick={() => setIsAnnModalOpen(true)}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 bg-primary border border-transparent rounded-lg text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <PlusIcon className="w-5 h-5 mr-1.5 -ml-1 text-primary-foreground" />
                            Criar Anúncio
                        </button>
                    </div>
                )}
            </div>

            {/* Main Feed Activity */}
            <div className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-center font-medium">
                        {error}
                        <button onClick={() => fetchData()} className="ml-4 underline">Tentar de novo</button>
                    </div>
                )}

                {combinedFeed.length === 0 && !error && (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                        <p className="text-muted-foreground font-medium">Nenhuma atividade recente encontrada.</p>
                    </div>
                )}

                {combinedFeed.map((item) => (
                    item.type === 'announcement' ? (
                        <AnnouncementCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            content={item.content}
                            date={new Date(item.created_at).toLocaleString()}
                            author={item.author_name || "Sistema"}
                        />
                    ) : (
                        <PollCard
                            key={item.id}
                            id={item.id}
                            question={item.question}
                            date={new Date(item.created_at).toLocaleString()}
                            expiresIn={item.expires_at ? "Ativa" : "Votação"}
                            totalVotes={item.options?.reduce((acc: number, o: any) => acc + o.votes_count, 0)}
                            hasVoted={item.has_voted}
                            options={item.options?.map((o: any) => ({
                                id: o.id,
                                text: o.text,
                                votes: o.votes_count
                            }))}
                            onVote={async () => fetchData()} // Refresh after vote
                        />
                    )
                ))}
            </div>

            <CreateAnnouncementModal 
                isOpen={isAnnModalOpen} 
                onClose={() => setIsAnnModalOpen(false)} 
                onSuccess={fetchData} 
            />
            
            <CreatePollModal 
                isOpen={isPollModalOpen} 
                onClose={() => setIsPollModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </div>
    );
};
