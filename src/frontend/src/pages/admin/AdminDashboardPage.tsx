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
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your entire CRM system from one place
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="data">Master Data</TabsTrigger>
          <TabsTrigger value="followups">Follow-Ups</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminOverviewPanel />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentManagementPanel />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <MasterDataPanel />
        </TabsContent>

        <TabsContent value="followups" className="space-y-6">
          <GlobalFollowUpsPanel />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ExportCenterPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
