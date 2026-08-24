import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    HomeIcon, 
    ChatBubbleLeftRightIcon, 
    QueueListIcon, 
    Cog6ToothIcon, 
    Bars3Icon, 
    XMarkIcon, 
    ArrowRightOnRectangleIcon, 
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

interface AppLayoutProps {
    children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, currentOrg, userRole } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', icon: HomeIcon, displayPath: '/dashboard', roles: ['Admin', 'Manager', 'Member'] },
        { name: 'Comunicação', icon: ChatBubbleLeftRightIcon, displayPath: '/comunicacao', roles: ['Admin', 'Manager', 'Member'] },
        { name: 'Processos', icon: QueueListIcon, displayPath: '/processos', roles: ['Admin', 'Manager', 'Member'] },
        { name: 'Análise Profunda', icon: ChartBarIcon, displayPath: '/analytics', roles: ['Admin', 'Manager'] },
        { name: 'Administração', icon: ShieldCheckIcon, displayPath: '/admin', roles: ['Admin'] },
    ].filter(item => item.roles.includes(userRole || 'Member'));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay via Headless UI */}
            <Transition.Root show={sidebarOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={React.Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={React.Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar-background px-6 pb-4 shadow-xl">
                                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border/50">
                                        <div className="flex items-center gap-x-2">
                                            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md" />
                                            <span className="text-xl font-bold font-heading text-sidebar-primary tracking-tight">
                                                Sync Community
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="-m-2.5 p-2.5 text-sidebar-foreground hover:text-sidebar-primary"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-2">
                                                    {navigation.map((item) => {
                                                        const isActive = location.pathname === item.displayPath;
                                                        return (
                                                            <li key={item.name}>
                                                                <Link
                                                                    to={item.displayPath}
                                                                    onClick={() => setSidebarOpen(false)}
                                                                    className={clsx(
                                                                        isActive
                                                                            ? 'bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm'
                                                                            : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50',
                                                                        'group flex w-full gap-x-3 rounded-md p-2.5 text-sm leading-6 transition-all duration-200'
                                                                    )}
                                                                >
                                                                    <item.icon
                                                                        className={clsx(
                                                                            isActive ? 'text-sidebar-primary' : 'text-sidebar-muted-foreground group-hover:text-sidebar-primary',
                                                                            'h-5 w-5 shrink-0 transition-colors'
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>
                                            <li className="mt-auto">
                                                <Link
                                                    to="/settings"
                                                    onClick={() => setSidebarOpen(false)}
                                                    className="group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary transition-all duration-200"
                                                >
                                                    <Cog6ToothIcon
                                                        className="h-6 w-6 shrink-0 text-sidebar-foreground group-hover:text-sidebar-primary transition-colors"
                                                        aria-hidden="true"
                                                    />
                                                    Configurações
                                                </Link>
                                            </li>
                                            <li className="mt-1">
                                                <button
                                                    onClick={() => logout()}
                                                    className="group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-destructive-foreground transition-all duration-200 w-full"
                                                >
                                                    <ArrowRightOnRectangleIcon
                                                        className="h-6 w-6 shrink-0 text-sidebar-foreground group-hover:text-destructive-foreground transition-colors"
                                                        aria-hidden="true"
                                                    />
                                                    Terminar Sessão
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col transition-all duration-300">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto gradient-primary border-r border-sidebar-border px-4 pb-4">
                    <div className="flex h-16 shrink-0 items-center px-4 gap-x-3">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg shadow-md border border-white/20" />
                        <h1 className="text-xl font-heading font-extrabold text-white tracking-tight">Sync Community</h1>
                    </div>

                    {currentOrg && (
                        <div className="px-6 pb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">{currentOrg.name}</span>
                        </div>
                    )}

                    <nav className="flex flex-1 flex-col px-4 pb-4 mt-2">
                        <ul role="list" className="flex flex-1 flex-col gap-y-2">
                            <li>
                                <ul role="list" className="-mx-2 space-y-2">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.displayPath;
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.displayPath}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={clsx(
                                                        isActive
                                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-white',
                                                        'group relative flex gap-x-3 rounded-lg p-3 text-sm font-semibold transition-all duration-200 ease-in-out'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={clsx(
                                                            isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-white',
                                                            'h-6 w-6 shrink-0 transition-colors'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTabSidebarMobile"
                                                            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                                                            initial={false}
                                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                        />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <Link
                                    to="/settings"
                                    className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-white transition-all duration-200"
                                >
                                    <Cog6ToothIcon
                                        className="h-6 w-6 shrink-0 text-sidebar-foreground group-hover:text-white transition-colors"
                                        aria-hidden="true"
                                    />
                                    Configurações
                                </Link>
                            </li>
                            <li className="mt-1">
                                <button
                                    onClick={() => logout()}
                                    className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-destructive-foreground transition-all duration-200 w-full"
                                >
                                    <ArrowRightOnRectangleIcon
                                        className="h-6 w-6 shrink-0 text-sidebar-foreground group-hover:text-destructive-foreground transition-colors"
                                        aria-hidden="true"
                                    />
                                    Terminar Sessão
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col lg:pl-64 relative">
                <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:px-6">
                    <div className="flex items-center gap-x-4 lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                        <span className="text-lg font-bold text-foreground font-heading">
                            Sync Community
                        </span>
                    </div>
                    {/* The right side placeholder for desktop & mobile spacing */}
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-x-4">
                        <NotificationBell />
                        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
                        <span className="sr-only">Your profile</span>
                        <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                            <span className="text-sm font-bold text-primary">{user?.full_name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="hidden lg:flex lg:flex-col lg:items-start ml-2">
                            <span className="text-sm font-bold leading-none text-foreground" aria-hidden="true">
                                {user?.full_name || 'Usuário Local'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 mt-1">
                                {userRole || 'Membro'}
                            </span>
                        </div>
                    </div>
                </div>

                <main className="flex-1 pb-10">
                    <div className="p-4 lg:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};
