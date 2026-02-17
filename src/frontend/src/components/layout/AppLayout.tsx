import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, LayoutDashboard, Users, Database, Calendar, FileText } from 'lucide-react';
import { SiCoffeescript } from 'react-icons/si';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'agent';
}

export default function AppLayout({ children, role }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">VR Homes Infra</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">
                {role === 'admin' ? 'Admin Dashboard' : 'Agent Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome, </span>
              <span className="font-medium">{userProfile?.name || 'User'}</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">{children}</main>

      <footer className="border-t bg-card mt-12">
        <div className="container py-6 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} VR Homes Infra CRM. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <SiCoffeescript className="h-4 w-4 text-primary" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
