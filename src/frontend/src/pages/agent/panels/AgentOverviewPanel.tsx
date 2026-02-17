import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { useGetAgentLeads, useGetAgentOwners, useGetAgentFollowUps } from '../../../hooks/useQueries';
import { TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
import { FollowUpStatus } from '../../../backend';

export default function AgentOverviewPanel() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const { data: leads = [], isLoading: leadsLoading } = useGetAgentLeads(principal);
  const { data: owners = [], isLoading: ownersLoading } = useGetAgentOwners(principal);
  const { data: followUps = [], isLoading: followUpsLoading } = useGetAgentFollowUps(principal);

  const isLoading = leadsLoading || ownersLoading || followUpsLoading;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime() * 1000000;
  const todayEnd = (today.getTime() + 86400000) * 1000000;

  const followUpsToday = followUps.filter(
    (f) => f.status === FollowUpStatus.pending && Number(f.date) >= todayStart && Number(f.date) < todayEnd
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Leads</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leads.length}</div>
          <p className="text-xs text-muted-foreground">Total leads assigned to you</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Owners</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{owners.length}</div>
          <p className="text-xs text-muted-foreground">Property owners you manage</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{followUpsToday}</div>
          <p className="text-xs text-muted-foreground">Tasks scheduled for today</p>
        </CardContent>
      </Card>
    </div>
  );
}
