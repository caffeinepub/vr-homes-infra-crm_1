import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentOverviewPanel from './panels/AgentOverviewPanel';
import AddLeadOwnerPanel from './panels/AddLeadOwnerPanel';
import FollowUpTrackerPanel from './panels/FollowUpTrackerPanel';

export default function AgentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-colorful">Agent Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your leads, owners, and follow-ups
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads & Owners</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="panel-surface p-6">
          <AgentOverviewPanel />
        </TabsContent>

        <TabsContent value="leads" className="panel-surface p-6">
          <AddLeadOwnerPanel />
        </TabsContent>

        <TabsContent value="followups" className="panel-surface p-6">
          <FollowUpTrackerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
