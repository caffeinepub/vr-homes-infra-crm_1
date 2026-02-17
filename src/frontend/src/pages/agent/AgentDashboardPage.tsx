import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentOverviewPanel from './panels/AgentOverviewPanel';
import FollowUpTrackerPanel from './panels/FollowUpTrackerPanel';
import AddLeadOwnerPanel from './panels/AddLeadOwnerPanel';

export default function AgentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-colorful mb-2">Agent Dashboard</h1>
        <p className="text-muted-foreground text-colorful-tertiary">
          Manage your leads, owners, and follow-ups
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview" className="dashboard-tab-trigger">
            Overview
          </TabsTrigger>
          <TabsTrigger value="followups" className="dashboard-tab-trigger">
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="leads-owners" className="dashboard-tab-trigger">
            Leads & Owners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="dashboard-panel-surface p-6">
          <AgentOverviewPanel />
        </TabsContent>

        <TabsContent value="followups" className="dashboard-panel-surface p-6">
          <FollowUpTrackerPanel />
        </TabsContent>

        <TabsContent value="leads-owners" className="dashboard-panel-surface p-6">
          <AddLeadOwnerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
