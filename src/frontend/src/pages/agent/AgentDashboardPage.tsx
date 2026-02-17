import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentOverviewPanel from './panels/AgentOverviewPanel';
import AddLeadOwnerPanel from './panels/AddLeadOwnerPanel';
import FollowUpTrackerPanel from './panels/FollowUpTrackerPanel';

export default function AgentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your leads, owners, and follow-ups
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Data</TabsTrigger>
          <TabsTrigger value="followups">Follow-Ups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AgentOverviewPanel />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <AddLeadOwnerPanel />
        </TabsContent>

        <TabsContent value="followups" className="space-y-6">
          <FollowUpTrackerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
