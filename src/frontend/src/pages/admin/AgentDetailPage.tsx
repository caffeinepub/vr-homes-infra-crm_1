import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAgentDetails, useGetAgentLeads } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { AgentStatus } from '../../backend';

export default function AgentDetailPage() {
  const { agentId } = useParams({ strict: false }) as { agentId: string };
  const navigate = useNavigate();
  
  const agentPrincipal = Principal.fromText(agentId);
  const { data: agent, isLoading: agentLoading } = useGetAgentDetails(agentPrincipal);
  const { data: leads = [], isLoading: leadsLoading } = useGetAgentLeads(agentPrincipal);

  const isLoading = agentLoading || leadsLoading;

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.active:
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case AgentStatus.pending:
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case AgentStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case AgentStatus.inactive:
        return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    }
  };

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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Agent not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/admin' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-card/50">
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={agent.photo.getDirectURL()} alt={agent.name} />
                <AvatarFallback className="text-2xl">{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{agent.name}</h3>
                {getStatusBadge(agent.status)}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{agent.mobile}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-card/50">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total Leads</span>
                </div>
                <p className="text-3xl font-bold">{leads.length}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Conversion Rate</span>
                </div>
                <p className="text-3xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
