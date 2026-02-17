import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminOverviewPanel from './panels/AdminOverviewPanel';
import AgentManagementPanel from './panels/AgentManagementPanel';
import MasterDataPanel from './panels/MasterDataPanel';
import GlobalFollowUpsPanel from './panels/GlobalFollowUpsPanel';
import ExportCenterPanel from './panels/ExportCenterPanel';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-colorful">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your real estate operations and team
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="data">Master Data</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="panel-surface p-6">
          <AdminOverviewPanel />
        </TabsContent>

        <TabsContent value="agents" className="panel-surface p-6">
          <AgentManagementPanel />
        </TabsContent>

        <TabsContent value="data" className="panel-surface p-6">
          <MasterDataPanel />
        </TabsContent>

        <TabsContent value="followups" className="panel-surface p-6">
          <GlobalFollowUpsPanel />
        </TabsContent>

        <TabsContent value="export" className="panel-surface p-6">
          <ExportCenterPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
