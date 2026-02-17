import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, XCircle, Ban, FileQuestion } from 'lucide-react';
import PageTheme from '../components/theme/PageTheme';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { reason?: string };
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const getErrorDetails = () => {
    switch (search.reason) {
      case 'not-admin':
        return {
          icon: <Ban className="h-10 w-10 text-destructive" />,
          title: 'Administrator Access Required',
          message: 'You do not have administrator privileges. Please contact your system administrator if you believe this is an error.',
        };
      case 'not-agent':
        return {
          icon: <XCircle className="h-10 w-10 text-destructive" />,
          title: 'Agent Access Required',
          message: 'You do not have agent privileges. Please contact your system administrator for access.',
        };
      case 'pending':
        return {
          icon: <Clock className="h-10 w-10 text-amber-500" />,
          title: 'Registration Pending',
          message: 'Your agent registration is pending approval. An administrator will review your application shortly.',
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-10 w-10 text-destructive" />,
          title: 'Registration Rejected',
          message: 'Your agent registration has been rejected. Please contact your system administrator for more information.',
        };
      case 'inactive':
        return {
          icon: <Ban className="h-10 w-10 text-muted-foreground" />,
          title: 'Account Inactive',
          message: 'Your agent account is currently inactive. Please contact your system administrator to reactivate your account.',
        };
      default:
        return {
          icon: <FileQuestion className="h-10 w-10 text-muted-foreground" />,
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
        };
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const details = getErrorDetails();

  return (
    <PageTheme variant="access-denied">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg shadow-medium bg-card border-border">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="p-4 bg-muted/50 rounded-full">
                {details.icon}
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{details.title}</CardTitle>
              <CardDescription className="text-base">{details.message}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {search.reason === 'pending' && (
              <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">Awaiting Approval</AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  You will receive access once an administrator approves your registration. This typically takes 1-2 business days.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-10"
              >
                Sign Out
              </Button>
              <Button
                onClick={() => navigate({ to: '/' })}
                className="w-full h-10 bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90 text-white"
              >
                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
}
