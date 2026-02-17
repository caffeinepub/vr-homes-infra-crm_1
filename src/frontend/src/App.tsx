import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AgentDashboardPage from './pages/agent/AgentDashboardPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import AgentDetailPage from './pages/admin/AgentDetailPage';
import AppLayout from './components/layout/AppLayout';
import { useGetCallerUserProfile, useGetCallerUserRole, useGetAgentDetails } from './hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { AgentStatus } from './backend';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no identity
  if (!identity) {
    return <Navigate to="/" />;
  }

  // Show loading while actor is being created
  if (actorFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Setting up session...</p>
        </div>
      </div>
    );
  }

  // If identity exists but actor failed to initialize, redirect to login
  // The login page will handle showing the appropriate error
  if (!actor) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: userRole, isLoading: roleLoading, isError: roleError } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isError: profileError } = useGetCallerUserProfile();

  if (roleLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle query errors gracefully
  if (roleError || profileError) {
    return <Navigate to="/" />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/access-denied" search={{ reason: 'not-admin' }} />;
  }

  if (!userProfile) {
    return <Navigate to="/access-denied" search={{ reason: 'no-profile' }} />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Agent route wrapper
function AgentRoute({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading, isError: roleError } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isError: profileError } = useGetCallerUserProfile();
  const { data: agentDetails, isLoading: agentLoading, isError: agentError } = useGetAgentDetails(identity?.getPrincipal());

  if (roleLoading || profileLoading || agentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle query errors gracefully
  if (roleError || profileError || agentError) {
    return <Navigate to="/" />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin" />;
  }

  if (!userProfile) {
    return <Navigate to="/access-denied" search={{ reason: 'no-profile' }} />;
  }

  if (!agentDetails) {
    return <Navigate to="/access-denied" search={{ reason: 'not-agent' }} />;
  }

  if (agentDetails.status === AgentStatus.pending) {
    return <Navigate to="/access-denied" search={{ reason: 'pending' }} />;
  }

  if (agentDetails.status === AgentStatus.rejected) {
    return <Navigate to="/access-denied" search={{ reason: 'rejected' }} />;
  }

  if (agentDetails.status === AgentStatus.inactive) {
    return <Navigate to="/access-denied" search={{ reason: 'inactive' }} />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Admin dashboard route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute>
      <AdminRoute>
        <AdminDashboardPage />
      </AdminRoute>
    </ProtectedRoute>
  ),
});

// Agent detail route
const agentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/agent/$agentId',
  component: () => (
    <ProtectedRoute>
      <AdminRoute>
        <AgentDetailPage />
      </AdminRoute>
    </ProtectedRoute>
  ),
});

// Agent dashboard route
const agentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent',
  component: () => (
    <ProtectedRoute>
      <AgentRoute>
        <AgentDashboardPage />
      </AgentRoute>
    </ProtectedRoute>
  ),
});

// Access denied route
const accessDeniedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/access-denied',
  component: AccessDeniedPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  loginRoute,
  adminRoute,
  agentDetailRoute,
  agentRoute,
  accessDeniedRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
