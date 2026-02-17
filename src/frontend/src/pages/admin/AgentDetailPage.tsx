import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAgentDetails, useGetAgentLeads } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { AgentStatus } from '../../backend';

export default function AgentDetailPage() {
  const { agentId } = useParams({ strict: false }) as { agentId: string };
  const navigate = useNavigate();
  const principal = Principal.fromText(agentId);
  const { data: agent, isLoading: agentLoading } = useGetAgentDetails(principal);
  const { data: leads = [], isLoading: leadsLoading } = useGetAgentLeads(principal);

  const isLoading = agentLoading || leadsLoading;

  // Calculate conversion rate (leads with status "closed" or "converted")
  const convertedLeads = leads.filter((l) => l.status.toLowerCase().includes('closed') || l.status.toLowerCase().includes('converted')).length;
  const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/admin' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Agent not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.active:
        return <Badge className="bg-green-500">Active</Badge>;
      case AgentStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      case AgentStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case AgentStatus.inactive:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/admin' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={agent.photo.getDirectURL()} alt={agent.name} />
                <AvatarFallback className="text-2xl">{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{agent.name}</h3>
                <p className="text-muted-foreground">{agent.mobile}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(agent.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Lead Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{conversionRate}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              {convertedLeads} converted out of {leads.length} total leads
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Converted Leads</p>
              <p className="text-2xl font-bold">{convertedLeads}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
              <p className="text-2xl font-bold">{leads.length - convertedLeads}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
