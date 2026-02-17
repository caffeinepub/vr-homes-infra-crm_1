import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, LogOut, Clock, XCircle } from 'lucide-react';
import PageTheme from '../components/theme/PageTheme';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/access-denied' });
  const reason = (search as any)?.reason || 'denied';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const getMessage = () => {
    switch (reason) {
      case 'pending':
        return {
          icon: <Clock className="h-12 w-12 text-warning" />,
          title: 'Approval Pending',
          description: 'Your agent registration is under review. You will be notified once approved.',
          color: 'warning',
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-12 w-12 text-destructive" />,
          title: 'Access Rejected',
          description: 'Your agent registration has been rejected. Please contact the administrator for more information.',
          color: 'destructive',
        };
      default:
        return {
          icon: <ShieldAlert className="h-12 w-12 text-destructive" />,
          title: 'Access Denied',
          description: 'You do not have permission to access this application. Please contact your administrator.',
          color: 'destructive',
        };
    }
  };

  const message = getMessage();

  return (
    <PageTheme variant="access-denied">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-medium bg-card border-2 border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-xl ${
                message.color === 'warning' 
                  ? 'bg-warning/10' 
                  : 'bg-destructive/10'
              }`}>
                {message.icon}
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold heading-colorful">
                {message.title}
              </CardTitle>
              <CardDescription className="text-base text-colorful-secondary">
                {message.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={`border-2 ${
              message.color === 'warning'
                ? 'border-warning/30 bg-warning/5'
                : 'border-destructive/30 bg-destructive/5'
            }`}>
              <AlertDescription className="text-center">
                {reason === 'pending' ? (
                  <span className="text-colorful-warning">
                    Please check back later or contact your administrator for updates on your approval status.
                  </span>
                ) : (
                  <span className="text-colorful-primary">
                    If you believe this is an error, please reach out to your system administrator for assistance.
                  </span>
                )}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2 border-primary/30 hover:border-primary/50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
}
