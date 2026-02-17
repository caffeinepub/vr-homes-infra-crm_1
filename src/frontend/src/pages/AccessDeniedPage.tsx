import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { reason?: string };
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const getErrorMessage = () => {
    switch (search.reason) {
      case 'not-admin':
        return 'You do not have administrator privileges. Please contact your system administrator if you believe this is an error.';
      case 'not-agent':
        return 'You are not registered as an agent. Please contact your administrator to get registered.';
      case 'pending':
        return 'Your agent account is pending approval. Please wait for an administrator to approve your account.';
      case 'rejected':
        return 'Your agent account has been rejected. Please contact your administrator for more information.';
      case 'inactive':
        return 'Your agent account is currently inactive. Please contact your administrator to reactivate your account.';
      case 'no-profile':
        return 'Your profile setup is incomplete. Please log out and try again.';
      default:
        return 'You do not have permission to access this area.';
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-2xl">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-base">{getErrorMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
