import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Loader2, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isLoggingIn } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [loginMode, setLoginMode] = useState<'admin' | 'agent'>('admin');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');

  // Handle post-login routing
  useEffect(() => {
    if (identity && userRole && profileFetched) {
      if (!userProfile) {
        setShowProfileSetup(true);
      } else if (userRole === 'admin') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/agent' });
      }
    }
  }, [identity, userRole, userProfile, profileFetched, navigate]);

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

  if (identity && (roleLoading || profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen login-page-gradient relative overflow-hidden">
        {/* Decorative orbs for loading state */}
        <div className="login-decorative-orb w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="login-decorative-orb w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-white drop-shadow-lg" />
          <p className="text-white font-medium drop-shadow-md">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen login-page-gradient relative overflow-hidden p-4">
      {/* Decorative gradient orbs */}
      <div className="login-decorative-orb w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
      <div className="login-decorative-orb w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      <div className="login-decorative-orb w-72 h-72 bg-gradient-to-br from-teal-400 to-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <Card className="w-full max-w-md login-card-glow relative z-10 border-2 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="p-4 login-icon-gradient rounded-3xl shadow-lg relative">
              <Building2 className="h-12 w-12 text-white drop-shadow-md" />
              <Sparkles className="h-5 w-5 text-white/90 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              VR Homes Infra CRM
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Unified login for admins and agents
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="space-y-4">
            <div className={`flex items-center justify-center space-x-4 p-5 rounded-xl transition-all duration-300 ${
              loginMode === 'admin' || loginMode === 'agent' ? 'login-mode-active' : 'bg-muted/50'
            }`}>
              <Label
                htmlFor="login-mode"
                className={`text-sm font-bold cursor-pointer transition-all duration-300 ${
                  loginMode === 'admin' 
                    ? 'text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text dark:from-purple-400 dark:to-pink-400 scale-105' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Admin Login
              </Label>
              <Switch
                id="login-mode"
                checked={loginMode === 'agent'}
                onCheckedChange={(checked) => setLoginMode(checked ? 'agent' : 'admin')}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
              />
              <Label
                htmlFor="login-mode"
                className={`text-sm font-bold cursor-pointer transition-all duration-300 ${
                  loginMode === 'agent' 
                    ? 'text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text dark:from-blue-400 dark:to-cyan-400 scale-105' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Agent Login
              </Label>
            </div>

            <div className="space-y-2 px-2">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {loginMode === 'admin'
                  ? '🔐 Sign in with Internet Identity to access the admin dashboard'
                  : '🚀 Sign in with Internet Identity to access your agent dashboard'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-bold login-button-gradient text-white shadow-xl border-0 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="text-xs text-center text-muted-foreground font-medium px-2">
              Secure authentication powered by Internet Computer
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl">Complete Your Profile</DialogTitle>
            <DialogDescription className="text-base">
              Please enter your name to complete the setup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm font-semibold">Full Name</Label>
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
                className="h-12 text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleProfileSetup}
              disabled={!profileName.trim() || saveProfile.isPending}
              className="h-11 px-8 font-semibold login-button-gradient text-white"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

