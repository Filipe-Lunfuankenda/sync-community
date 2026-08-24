import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
    UserIcon, 
    ShieldCheckIcon, 
    BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
    const { user, currentOrg, userRole } = useAuth();
    const [activeTab, setActiveTab] = React.useState<'profile' | 'modules' | 'org'>('profile');
    const [areas, setAreas] = React.useState<any[]>([]);
    const [newArea, setNewArea] = React.useState({ name: '', type: 'other' });

    const fetchAreas = async () => {
        try {
            const response = await api.get('/management');
            setAreas(response.data);
        } catch (error) {
            console.error("Failed to fetch areas", error);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'modules') fetchAreas();
    }, [activeTab]);

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/management', newArea);
            setNewArea({ name: '', type: 'other' });
            fetchAreas();
        } catch (error) {
            console.error("Failed to create area", error);
        }
    };

    const handleDeleteArea = async (id: string) => {
        try {
            await api.delete(`/management/${id}`);
            fetchAreas();
        } catch (error) {
            console.error("Failed to delete area", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie sua conta e as preferências da organização.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar links for settings */}
                <div className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                        <UserIcon className="w-5 h-5" /> Perfil
                    </button>
                    {(userRole === 'Admin' || userRole === 'Manager') && (
                        <button 
                            onClick={() => setActiveTab('modules')}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'modules' ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            <BuildingOfficeIcon className="w-5 h-5" /> Módulos de Gestão
                        </button>
                    )}
                    {(userRole === 'Admin') && (
                        <button 
                            onClick={() => setActiveTab('org')}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'org' ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            <ShieldCheckIcon className="w-5 h-5" /> Organização
                        </button>
                    )}
                </div>

                {/* Main settings content */}
                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'profile' && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-muted/30">
                                <h2 className="text-lg font-bold">Informações do Perfil</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Nome Completo</label>
                                        <p className="font-medium text-foreground">{user?.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                                        <p className="font-medium text-foreground">{user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Função na Comunidade</label>
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                                                {userRole || 'Membro'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-sm">
                                    Editar Perfil
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'modules' && (
                        <div className="space-y-6">
                            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border bg-muted/30">
                                    <h2 className="text-lg font-bold">Áreas de Gestão Modulares</h2>
                                    <p className="text-xs text-muted-foreground mt-1">Defina como a sua organização é gerida (ex: Financeiro, Logística, Outros).</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <form onSubmit={handleCreateArea} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-muted/20 p-4 rounded-xl border border-border/50">
                                        <div className="sm:col-span-1 space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nome da Área</label>
                                            <input 
                                                required
                                                placeholder="Ex: Eventos" 
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={newArea.name}
                                                onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-accent-foreground">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Tipo de Gestão</label>
                                            <select 
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={newArea.type}
                                                onChange={(e) => setNewArea({...newArea, type: e.target.value})}
                                            >
                                                <option value="other">Outro</option>
                                                <option value="finance">Financeiro</option>
                                                <option value="communication">Comunicação</option>
                                                <option value="events">Eventos</option>
                                                <option value="legal">Jurídico</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-md">
                                            Adicionar
                                        </button>
                                    </form>

                                    <div className="space-y-3">
                                        {areas.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground italic text-sm">Nenhuma área definida ainda.</div>
                                        ) : (
                                            areas.map(area => (
                                                <div key={area.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                                                    <div>
                                                        <h4 className="font-bold text-foreground">{area.name}</h4>
                                                        <span className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground/60">{area.type}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteArea(area.id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'org' && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Gestão da Organização</h2>
                                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Organização</label>
                                    <p className="font-medium text-lg text-foreground">{currentOrg?.name}</p>
                                </div>
                                <div className="pt-2">
                                    <button className="px-5 py-2.5 border border-border rounded-xl font-bold text-sm hover:bg-accent transition-all">
                                        Configurações Avançadas
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
