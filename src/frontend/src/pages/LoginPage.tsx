import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useGetCallerUserRole, useGetCallerUserProfile, useSaveCallerUserProfile, useGetAgentDetails } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Loader2, Shield, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AgentRegistrationForm from '../components/auth/AgentRegistrationForm';
import PageTheme from '../components/theme/PageTheme';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus, isLoggingIn, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userRole, isLoading: roleLoading, isError: roleError, refetch: refetchRole } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, isError: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const { data: agentDetails, isLoading: agentLoading, isFetched: agentFetched, isError: agentError, refetch: refetchAgent } = useGetAgentDetails(identity?.getPrincipal());
  const saveProfile = useSaveCallerUserProfile();

  const [loginMode, setLoginMode] = useState<'admin' | 'agent'>('admin');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAgentRegistration, setShowAgentRegistration] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [postLoginError, setPostLoginError] = useState<string | null>(null);

  // Detect post-login failures
  useEffect(() => {
    if (identity && actor && (roleError || profileError || (loginMode === 'agent' && agentError))) {
      const errorMsg = 'Sign-in succeeded, but we could not load your account. Please try again.';
      setPostLoginError(errorMsg);
      console.error('Post-login query errors:', { roleError, profileError, agentError });
    }
  }, [identity, actor, roleError, profileError, agentError, loginMode]);

  // Handle post-login routing
  useEffect(() => {
    if (identity && actor && userRole && profileFetched && !postLoginError) {
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
  }, [identity, actor, userRole, userProfile, profileFetched, agentDetails, agentFetched, loginMode, navigate, postLoginError]);

  const handleLogin = async () => {
    setPostLoginError(null);
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle stale authentication state
      if (error.message?.includes('already authenticated')) {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleProfileSetup = async () => {
    if (!profileName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        name: profileName.trim(),
        role: loginMode,
      });
      setShowProfileSetup(false);
      toast.success('Profile created successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleRegistrationSuccess = () => {
    setShowAgentRegistration(false);
    navigate({ to: '/access-denied', search: { reason: 'pending' } });
  };

  const handleRetryPostLogin = async () => {
    setPostLoginError(null);
    try {
      await Promise.all([
        refetchRole(),
        refetchProfile(),
        loginMode === 'agent' ? refetchAgent() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Retry failed:', error);
      setPostLoginError('Still unable to load your account. Please try logging out and signing in again.');
    }
  };

  const handleLogoutAndRetry = async () => {
    setPostLoginError(null);
    await clear();
    toast.info('Please sign in again');
  };

  // Show loading state while authenticating or initializing
  if (identity && !actor && actorFetching) {
    return (
      <PageTheme variant="login">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="text-lg font-medium text-white">Setting up your session...</p>
          </div>
        </div>
      </PageTheme>
    );
  }

  // Show loading state while fetching user data
  if (identity && actor && (roleLoading || profileLoading || (loginMode === 'agent' && agentLoading)) && !postLoginError) {
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

  // Show session setup failure
  if (identity && !actor && !actorFetching) {
    return (
      <PageTheme variant="login">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-medium bg-card border-2 border-destructive/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-destructive/10 rounded-xl">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold heading-colorful">Session Setup Failed</CardTitle>
              <CardDescription className="text-colorful-warning">
                Session Setup failed, kindly refresh it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleLogoutAndRetry}
                variant="outline"
                className="w-full border-primary/30"
              >
                Log Out and Sign In Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTheme>
    );
  }

  return (
    <PageTheme variant="login">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-medium bg-card border-2 border-primary/20">
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
              <CardDescription className="text-base text-colorful-secondary">
                Professional Real Estate Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            {/* Login error alert */}
            {isLoginError && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sign-in failed. Please try again. If the problem persists, try clearing your browser cache.
                </AlertDescription>
              </Alert>
            )}

            {/* Post-login error alert */}
            {postLoginError && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <p>{postLoginError}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRetryPostLogin}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Retry
                    </Button>
                    <Button
                      onClick={handleLogoutAndRetry}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      Log Out
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-muted/50 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 transition-colors ${loginMode === 'admin' ? 'text-[var(--text-accent-primary)]' : 'text-muted-foreground'}`} />
                  <Label
                    htmlFor="login-mode"
                    className={`text-sm font-medium cursor-pointer transition-colors ${
                      loginMode === 'admin' 
                        ? 'text-colorful-primary' 
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
                        ? 'text-colorful-tertiary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    Agent
                  </Label>
                  <Users className={`h-4 w-4 transition-colors ${loginMode === 'agent' ? 'text-[var(--text-accent-tertiary)]' : 'text-muted-foreground'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  {loginMode === 'admin'
                    ? <><span className="text-colorful-primary">Sign in with Internet Identity</span> to access administrative controls and system management.</>
                    : <><span className="text-colorful-tertiary">Sign in with Internet Identity</span> to access your agent dashboard and manage your portfolio.</>}
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
              <p className="text-xs text-center text-colorful-success">
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
              <DialogTitle className="heading-colorful">Complete Your Profile</DialogTitle>
              <DialogDescription className="text-colorful-secondary">
                Please enter your name to complete the setup.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="label-colorful">Your Name</Label>
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your full name"
                  className="border-primary/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleProfileSetup}
                disabled={!profileName.trim() || saveProfile.isPending}
                className="bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90 text-white"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
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
