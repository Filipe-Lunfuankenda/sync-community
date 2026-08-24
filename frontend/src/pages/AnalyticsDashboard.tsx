import React from 'react';
import {
    UsersIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClockIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
}

const StatCard: React.FC<StatCardProps & { index: number }> = ({ label, value, icon: Icon, trend, trendType, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group bg-card rounded-lg border border-border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
    >
        <div className="absolute -inset-4 gradient-primary opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 z-0" />

        <div className="relative z-10 flex justify-between items-start">
            <div className="p-3 bg-primary/10 rounded-md border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${trendType === 'positive' ? 'bg-success/15 text-success' :
                    trendType === 'negative' ? 'bg-destructive/15 text-destructive' :
                        'bg-muted text-muted-foreground'
                    }`}>
                    {trendType === 'positive' ? '↑' : trendType === 'negative' ? '↓' : ''} {trend}
                </span>
            )}
        </div>
        <div className="relative z-10 mt-6">
            <h4 className="text-3xl font-extrabold text-foreground tracking-tight">{value}</h4>
            <p className="text-sm font-semibold text-muted-foreground mt-1">{label}</p>
        </div>
    </motion.div>
);

export const AnalyticsDashboard: React.FC = () => {
    const { currentOrg } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [chartData, setChartData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!currentOrg) return;

            try {
                setLoading(true);
                const [statsRes, chartsRes] = await Promise.all([
                    api.get('/analytics/dashboard'),
                    api.get('/analytics/charts')
                ]);
                setStats(statsRes.data);
                setChartData(chartsRes.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Não foi possível carregar as estatísticas.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentOrg]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
                {error}
            </div>
        );
    }

    // Display fallback or stats
    const displayStats = stats || {
        total_members: 0,
        active_polls: 0,
        pending_processes: 0,
        avg_approval_time_hours: 0,
        engagement_score: 0
    };

    // Chart Data
    const growthData = chartData?.growth_chart || [];
    const workflowData = chartData?.workflow_chart || [];

    return (
        <div className="max-w-7xl mx-auto py-6 lg:py-8 animate-fade-in space-y-8 px-4 sm:px-6">
            {/* Header Area */}
            <div className="relative">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Dashboard de Inteligência</h1>
                <p className="text-base text-muted-foreground mt-2 font-medium max-w-2xl leading-relaxed">
                    Acompanhe em tempo real a saúde, o engajamento e a evolução da sua comunidade através de dados precisos.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    index={0}
                    label="Membros Ativos"
                    value={displayStats.total_members}
                    icon={UsersIcon}
                    trend="Membro(as)" trendType="positive"
                />
                <StatCard
                    index={1}
                    label="Score de Engajamento"
                    value={`${Math.round(displayStats.engagement_score)}/100`}
                    icon={BoltIcon}
                    trend="Índice" trendType="neutral"
                />
                <StatCard
                    index={2}
                    label="Votações Ativas"
                    value={displayStats.active_polls}
                    icon={ChartBarIcon}
                />
                <StatCard
                    index={3}
                    label="Processos Pendentes"
                    value={displayStats.pending_processes}
                    icon={DocumentTextIcon}
                />
                <StatCard
                    index={4}
                    label="Tempo Méd. Aprovação"
                    value={`${displayStats.avg_approval_time_hours}h`}
                    icon={ClockIcon}
                />
            </div>

            {/* Graph / Chart Area */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col"
                >
                    <h3 className="text-lg font-bold text-card-foreground mb-1">Crescimento de Membros</h3>
                    <p className="text-sm text-muted-foreground mb-6 font-medium">Evolução do número de membros e taxa de adesão.</p>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                                />
                                <Bar dataKey="series1" name="Membros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="series2" name="Novos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col"
                >
                    <h3 className="text-lg font-bold text-card-foreground mb-1">Atividade de Processos</h3>
                    <p className="text-sm text-muted-foreground mb-6 font-medium">Fluxo de resolução de processos nas últimas semanas.</p>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={workflowData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                                />
                                <Line type="monotone" dataKey="series1" name="Concluídos" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--success))' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="series2" name="Pendentes" stroke="hsl(var(--warning))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--warning))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
