import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminOverviewPanel from './panels/AdminOverviewPanel';
import AgentManagementPanel from './panels/AgentManagementPanel';
import ExportCenterPanel from './panels/ExportCenterPanel';
import MasterDataPanel from './panels/MasterDataPanel';
import GlobalFollowUpsPanel from './panels/GlobalFollowUpsPanel';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-colorful mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-colorful-secondary">
          Manage your real estate operations and team
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview" className="dashboard-tab-trigger">
            Overview
          </TabsTrigger>
          <TabsTrigger value="master-data" className="dashboard-tab-trigger">
            Master Data
          </TabsTrigger>
          <TabsTrigger value="agents" className="dashboard-tab-trigger">
            Agents
          </TabsTrigger>
          <TabsTrigger value="followups" className="dashboard-tab-trigger">
            Follow-Ups
          </TabsTrigger>
          <TabsTrigger value="export" className="dashboard-tab-trigger">
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="dashboard-panel-surface p-6">
          <AdminOverviewPanel />
        </TabsContent>

        <TabsContent value="master-data" className="dashboard-panel-surface p-6">
          <MasterDataPanel />
        </TabsContent>

        <TabsContent value="agents" className="dashboard-panel-surface p-6">
          <AgentManagementPanel />
        </TabsContent>

        <TabsContent value="followups" className="dashboard-panel-surface p-6">
          <GlobalFollowUpsPanel />
        </TabsContent>

        <TabsContent value="export" className="dashboard-panel-surface p-6">
          <ExportCenterPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
