import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllAgents, useUpdateAgentStatus, useCreateAgent } from '../../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, UserPlus, Loader2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { AgentStatus, ExternalBlob } from '../../../backend';
import { toast } from 'sonner';

export default function AgentManagementPanel() {
  const navigate = useNavigate();
  const { data: agents = [], isLoading } = useGetAllAgents();
  const updateStatus = useUpdateAgentStatus();
  const createAgent = useCreateAgent();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentMobile, setNewAgentMobile] = useState('');
  const [newAgentPhoto, setNewAgentPhoto] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.active:
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case AgentStatus.pending:
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case AgentStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case AgentStatus.inactive:
        return <Badge variant="outline" className="text-slate-500">Inactive</Badge>;
    }
  };

  const handleStatusChange = async (agentId: any, status: AgentStatus) => {
    try {
      await updateStatus.mutateAsync({ agentId, status });
      const statusText = status === AgentStatus.active ? 'approved and activated' : status;
      toast.success(`Agent status updated to ${statusText}`);
    } catch (error) {
      toast.error('Failed to update agent status');
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgentName.trim() || !newAgentMobile.trim() || !newAgentPhoto) {
      toast.error('Please fill all fields and upload a photo');
      return;
    }

    try {
      const photoBytes = new Uint8Array(await newAgentPhoto.arrayBuffer());
      const photoBlob = ExternalBlob.fromBytes(photoBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createAgent.mutateAsync({
        name: newAgentName.trim(),
        mobile: newAgentMobile.trim(),
        photo: photoBlob,
      });

      toast.success('Agent created successfully');
      setShowCreateDialog(false);
      setNewAgentName('');
      setNewAgentMobile('');
      setNewAgentPhoto(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to create agent');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Separate agents by status for better organization
  const pendingAgents = agents.filter(a => a.status === AgentStatus.pending);
  const activeAgents = agents.filter(a => a.status === AgentStatus.active);
  const otherAgents = agents.filter(a => a.status !== AgentStatus.pending && a.status !== AgentStatus.active);

  return (
    <div className="space-y-6">
      <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Agent Management</CardTitle>
            {pendingAgents.length > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                {pendingAgents.length} agent{pendingAgents.length !== 1 ? 's' : ''} pending approval
              </p>
            )}
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...pendingAgents, ...activeAgents, ...otherAgents].map((agent) => (
                <TableRow key={agent.id.toString()} className={agent.status === AgentStatus.pending ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={agent.photo.getDirectURL()} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.mobile}</TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: '/admin/agent/$agentId', params: { agentId: agent.id.toString() } })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {agent.status === AgentStatus.pending && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => handleStatusChange(agent.id, AgentStatus.active)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleStatusChange(agent.id, AgentStatus.rejected)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, AgentStatus.active)}>
                            Approve & Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, AgentStatus.rejected)}>
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, AgentStatus.inactive)}>
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>Add a new agent to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Full Name</Label>
              <Input
                id="agent-name"
                placeholder="Enter agent name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-mobile">Mobile Number</Label>
              <Input
                id="agent-mobile"
                placeholder="Enter mobile number"
                value={newAgentMobile}
                onChange={(e) => setNewAgentMobile(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-photo">Profile Photo</Label>
              <Input
                id="agent-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setNewAgentPhoto(e.target.files?.[0] || null)}
              />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} disabled={createAgent.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {createAgent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
