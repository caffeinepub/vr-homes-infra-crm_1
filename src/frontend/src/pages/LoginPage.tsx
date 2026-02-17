import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile, useSaveCallerUserProfile, useGetAgentDetails } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Loader2, Shield, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AgentRegistrationForm from '../components/auth/AgentRegistrationForm';
import PageTheme from '../components/theme/PageTheme';

export default function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isLoggingIn } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: agentDetails, isLoading: agentLoading, isFetched: agentFetched } = useGetAgentDetails(identity?.getPrincipal());
  const saveProfile = useSaveCallerUserProfile();

  const [loginMode, setLoginMode] = useState<'admin' | 'agent'>('admin');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAgentRegistration, setShowAgentRegistration] = useState(false);
  const [profileName, setProfileName] = useState('');

  // Handle post-login routing
  useEffect(() => {
    if (identity && userRole && profileFetched) {
      if (!userProfile) {
        setShowProfileSetup(true);
      } else if (userRole === 'admin') {
        navigate({ to: '/admin' });
      } else if (loginMode === 'agent') {
        // Check if agent record exists
        if (agentFetched && !agentDetails) {
          setShowAgentRegistration(true);
        } else if (agentDetails) {
          navigate({ to: '/agent' });
        }
      } else {
        navigate({ to: '/agent' });
      }
    }
  }, [identity, userRole, userProfile, profileFetched, agentDetails, agentFetched, loginMode, navigate]);

  const handleLogin = () => {
    login();
  };

  const handleProfileSetup = async () => {
    if (!profileName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        name: profileName.trim(),
        role: loginMode,
      });
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowAgentRegistration(false);
    navigate({ to: '/access-denied', search: { reason: 'pending' } });
  };

  if (identity && (roleLoading || profileLoading || (loginMode === 'agent' && agentLoading))) {
    return (
      <PageTheme variant="login">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="text-lg font-medium text-white">Loading your dashboard...</p>
          </div>
        </div>
      </PageTheme>
    );
  }

  return (
    <PageTheme variant="login">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-medium bg-card border-border">
          <CardHeader className="space-y-6 text-center pb-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-gradient-accent-start to-gradient-accent-end rounded-xl shadow-soft">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold heading-colorful">
                VR Homes Infra CRM
              </CardTitle>
              <CardDescription className="text-base">
                Professional Real Estate Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 transition-colors ${loginMode === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Label
                    htmlFor="login-mode"
                    className={`text-sm font-medium cursor-pointer transition-colors ${
                      loginMode === 'admin' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Administrator
                  </Label>
                </div>
                <Switch
                  id="login-mode"
                  checked={loginMode === 'agent'}
                  onCheckedChange={(checked) => setLoginMode(checked ? 'agent' : 'admin')}
                />
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="login-mode"
                    className={`text-sm font-medium cursor-pointer transition-colors ${
                      loginMode === 'agent' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Agent
                  </Label>
                  <Users className={`h-4 w-4 transition-colors ${loginMode === 'agent' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  {loginMode === 'admin'
                    ? 'Sign in with Internet Identity to access administrative controls and system management.'
                    : 'Sign in with Internet Identity to access your agent dashboard and manage your portfolio.'}
                </p>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-11 text-base font-medium bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90 text-white shadow-soft transition-all"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-px flex-1 bg-border" />
              <p className="text-xs text-center text-muted-foreground">
                Secure Authentication
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Setup Dialog */}
        <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
              <DialogDescription>
                Please enter your name to complete the setup process.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="profile-name"
                  placeholder="Enter your full name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && profileName.trim()) {
                      handleProfileSetup();
                    }
                  }}
                  className="h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleProfileSetup}
                disabled={!profileName.trim() || saveProfile.isPending}
                className="h-10 px-6 font-medium bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90 text-white"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Agent Registration Dialog */}
        {showAgentRegistration && (
          <AgentRegistrationForm
            open={showAgentRegistration}
            onOpenChange={setShowAgentRegistration}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </PageTheme>
  );
}
