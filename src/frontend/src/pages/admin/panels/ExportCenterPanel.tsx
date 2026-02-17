import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useGetAllAgents, useGetAllLeads, useGetAllOwners } from '../../../hooks/useQueries';
import { toast } from 'sonner';
import { downloadCSV } from '../../../utils/downloads';

export default function ExportCenterPanel() {
  const { data: agents = [] } = useGetAllAgents();
  const { data: leads = [] } = useGetAllLeads();
  const { data: owners = [] } = useGetAllOwners();

  const handleExportAgentLogins = () => {
    try {
      const data = agents.map((agent) => ({
        Name: agent.name,
        Mobile: agent.mobile,
        Status: agent.status,
        'Principal ID': agent.id.toString(),
      }));

      downloadCSV(data, 'agent-logins.csv');
      toast.success('Agent logins CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export agent logins CSV');
    }
  };

  const handleExportLeadMaster = () => {
    try {
      const data = leads.map((lead) => ({
        ID: lead.id.toString(),
        Name: lead.name,
        Mobile: lead.mobile,
        'Property Type': lead.propertyType,
        'Lead Type': lead.leadType,
        Price: Number(lead.price),
        'Lead Level': lead.leadLevel,
        Source: lead.source,
        Status: lead.status,
        Requirements: lead.requirements || '',
        'Created At': new Date(Number(lead.createdAt) / 1000000).toLocaleDateString(),
      }));

      downloadCSV(data, 'lead-master-report.csv');
      toast.success('Lead master report CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export lead master report CSV');
    }
  };

  const handleExportOwnerReport = () => {
    try {
      const data = owners.map((owner) => ({
        ID: owner.id.toString(),
        Name: owner.name,
        Mobile: owner.mobile,
        'Property Type': owner.propertyType,
        Location: owner.location,
        Address: owner.address,
        Price: Number(owner.price),
        'Agent Commission': Number(owner.agentCommission),
        'Verification Status': owner.verificationStatus,
        Remarks: owner.remarks,
        'Created At': new Date(Number(owner.createdAt) / 1000000).toLocaleDateString(),
      }));

      downloadCSV(data, 'customer-owner-report.csv');
      toast.success('Customer/Owner report CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export customer/owner report CSV');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <FileText className="h-8 w-8 mb-2 text-colorful-secondary" />
          <CardTitle className="text-colorful-primary">Agent Logins</CardTitle>
          <CardDescription className="text-colorful-secondary">Export all agent login information as CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportAgentLogins} className="w-full bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <FileText className="h-8 w-8 mb-2 text-colorful-tertiary" />
          <CardTitle className="text-colorful-primary">Lead Master Report</CardTitle>
          <CardDescription className="text-colorful-secondary">Export complete lead database as CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportLeadMaster} className="w-full bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <FileText className="h-8 w-8 mb-2 text-colorful-success" />
          <CardTitle className="text-colorful-primary">Customer/Owner Report</CardTitle>
          <CardDescription className="text-colorful-secondary">Export owner database as CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportOwnerReport} className="w-full bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
