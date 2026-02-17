import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllLeads, useGetAllAgents, useGetAllFollowUps } from '../../../hooks/useQueries';
import { Users, TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { LeadType, FollowUpStatus, AgentStatus } from '../../../backend';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function AdminOverviewPanel() {
  const { data: leads = [], isLoading: leadsLoading } = useGetAllLeads();
  const { data: agents = [], isLoading: agentsLoading } = useGetAllAgents();
  const { data: followUps = [], isLoading: followUpsLoading } = useGetAllFollowUps();

  const isLoading = leadsLoading || agentsLoading || followUpsLoading;

  // Calculate stats
  const totalLeads = leads.length;
  const activeAgents = agents.filter((a) => a.status === AgentStatus.active).length;
  const totalRevenue = leads.reduce((sum, lead) => sum + Number(lead.price), 0);
  const pendingFollowUps = followUps.filter((f) => f.status === FollowUpStatus.pending).length;

  // Sales vs Rent data
  const salesLeads = leads.filter((l) => l.leadType === LeadType.sale).length;
  const rentLeads = leads.filter((l) => l.leadType === LeadType.rent).length;

  const chartData = [
    { type: 'Sale', count: salesLeads },
    { type: 'Rent', count: rentLeads },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Active opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">Out of {agents.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">From all leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales vs Rent Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: 'Leads',
                color: 'oklch(var(--chart-1))',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="oklch(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
