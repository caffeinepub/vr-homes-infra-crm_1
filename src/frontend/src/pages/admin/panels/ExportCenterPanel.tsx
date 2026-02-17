import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useGetAllAgents, useGetAllLeads, useGetAllOwners } from '../../../hooks/useQueries';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel } from '../../../utils/downloads';

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
      toast.success('Agent logins exported successfully');
    } catch (error) {
      toast.error('Failed to export agent logins');
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

      downloadExcel(data, 'lead-master-report.xlsx');
      toast.success('Lead master report exported successfully');
    } catch (error) {
      toast.error('Failed to export lead master report');
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

      downloadExcel(data, 'customer-owner-report.xlsx');
      toast.success('Customer/Owner report exported successfully');
    } catch (error) {
      toast.error('Failed to export customer/owner report');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <FileText className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Agent Logins</CardTitle>
          <CardDescription>Export all agent login information as CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportAgentLogins} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Lead Master Report</CardTitle>
          <CardDescription>Export complete lead database as Excel</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportLeadMaster} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Customer/Owner Report</CardTitle>
          <CardDescription>Export owner database as Excel</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportOwnerReport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
