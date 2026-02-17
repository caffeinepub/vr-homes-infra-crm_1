import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Shield, Users } from 'lucide-react';
import PageTheme from '../theme/PageTheme';
import { SiX, SiFacebook, SiLinkedin, SiInstagram } from 'react-icons/si';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const pageVariant = userRole === 'admin' ? 'admin' : 'agent';

  return (
    <PageTheme variant={pageVariant}>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-gradient-accent-start to-gradient-accent-end rounded-lg shadow-soft">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold heading-colorful">VR Homes Infra CRM</h1>
                  <p className="text-xs">
                    <span className="text-colorful-primary">{userProfile?.name || 'User'}</span>
                    {userRole === 'admin' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-colorful-secondary">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                    {userRole === 'user' && (
                      <span className="ml-2 inline-flex items-center gap-1 text-colorful-tertiary">
                        <Users className="h-3 w-3" />
                        Agent
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-primary/30 hover:border-primary/50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="border-t border-primary/20 bg-card/80 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center md:text-left">
                <span className="text-colorful-primary">© {new Date().getFullYear()} VR Homes Infra CRM.</span> All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[var(--text-accent-primary)] transition-colors"
                  aria-label="Twitter"
                >
                  <SiX className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[var(--text-accent-secondary)] transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[var(--text-accent-tertiary)] transition-colors"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[var(--text-accent-warning)] transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-4 w-4" />
                </a>
              </div>
              <div className="text-sm text-muted-foreground text-center md:text-right">
                Built with <span className="text-colorful-warning">❤️</span> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'vr-homes-crm'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-colorful-primary hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTheme>
  );
}
