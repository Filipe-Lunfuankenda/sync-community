import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    full_name: string;
    is_superuser: boolean;
}

interface Organization {
    id: string;
    name: string;
    subdomain?: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    currentOrg: Organization | null;
    userRole: string | null;  // New field
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    switchOrganization: (orgId: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('access_token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    // Fetch user profile
                    const userObj = await api.get('/users/me');
                    setUser(userObj.data);

                    // Decode token to see if we have an active org_id injected
                    const decoded: any = jwtDecode(storedToken);
                    if (decoded.org_id) {
                        setCurrentOrg({ id: decoded.org_id, name: "Sua Organização", is_active: true });
                        
                        // Fetch the role for this org
                        const orgsRes = await api.get('/users/me/organizations');
                        const currentMembership = orgsRes.data.find((m: any) => m.organization_id === decoded.org_id);
                        if (currentMembership) {
                            setUserRole(currentMembership.role_name);
                        }
                    }
                } catch (error) {
                    console.error("Failed to restore session", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string) => {
        // Note: OAuth2 in FastAPI expects FormData, so we send it as URL encoded
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const newToken = response.data.access_token;
        setToken(newToken);
        localStorage.setItem('access_token', newToken);

        // Fetch profile
        const userResponse = await api.get('/users/me');
        const userData = userResponse.data;
        setUser(userData);

        // Auto-switch to first org if available
        try {
            const memberships = await api.get('/users/me/organizations');
            if (memberships.data && memberships.data.length > 0) {
                const firstOrg = memberships.data[0];
                await switchOrganization(firstOrg.organization_id);
                setUserRole(firstOrg.role_name);
            }
        } catch (e) {
            console.warn("User has no organizations yet or failed to fetch", e);
        }
    };

    const switchOrganization = async (orgId: string) => {
        try {
            const response = await api.post(`/auth/switch-org/${orgId}`);
            const orgToken = response.data.access_token;

            setToken(orgToken);
            localStorage.setItem('access_token', orgToken);

            // Update Context
            setCurrentOrg({ id: orgId, name: "Carregando...", is_active: true });

            // Update Role
            const orgsRes = await api.get('/users/me/organizations');
            const currentMembership = orgsRes.data.find((m: any) => m.organization_id === orgId);
            if (currentMembership) {
                setUserRole(currentMembership.role_name);
            }

            // We could force a location reload or just rely on state changes
        } catch (error) {
            console.error("Failed to switch org", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setCurrentOrg(null);
        setUserRole(null);
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{
            user,
            currentOrg,
            userRole,
            token,
            isAuthenticated: !!user && !!token,
            login,
            logout,
            switchOrganization,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
