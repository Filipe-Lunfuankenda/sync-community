import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { AppLayout } from './components/Layout/AppLayout';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CommunicationFeed } from './pages/CommunicationFeed';
import { WorkflowBoard } from './pages/WorkflowBoard';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Protected Route Wrapper
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main layout wrapper that handles the generic UI frames
const DashboardLayout: React.FC = () => {
  // The setCurrentView is handled by react-router Links now inside AppLayout Sidebar
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AnalyticsDashboard />} />
        <Route path="/comunicacao" element={<CommunicationFeed />} />
        <Route path="/processos" element={<WorkflowBoard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
