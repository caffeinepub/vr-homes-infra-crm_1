import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { useGetAgentFollowUps, useGetAgentLeads, useCreateFollowUp, useUpdateFollowUp } from '../../../hooks/useQueries';
import { FollowUpStatus, FollowUp } from '../../../backend';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FollowUpTrackerPanel() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const { data: followUps = [], isLoading } = useGetAgentFollowUps(principal);
  const { data: leads = [] } = useGetAgentLeads(principal);
  const createFollowUp = useCreateFollowUp();
  const updateFollowUp = useUpdateFollowUp();

  const [showDialog, setShowDialog] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [followUpForm, setFollowUpForm] = useState({
    leadId: '',
    date: '',
    priority: 'Medium',
    taskType: 'Call',
    remarks: '',
  });

  const now = Date.now() * 1000000;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: FollowUpStatus, date: bigint) => {
    if (status === FollowUpStatus.completed) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (Number(date) < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const resetForm = () => {
    setFollowUpForm({
      leadId: '',
      date: '',
      priority: 'Medium',
      taskType: 'Call',
      remarks: '',
    });
    setEditingFollowUp(null);
  };

  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    const date = new Date(Number(followUp.date) / 1000000);
    setFollowUpForm({
      leadId: followUp.leadId.toString(),
      date: date.toISOString().split('T')[0],
      priority: followUp.priority,
      taskType: followUp.taskType,
      remarks: followUp.remarks,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!followUpForm.leadId || !followUpForm.date) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const dateTimestamp = BigInt(new Date(followUpForm.date).getTime() * 1000000);

      if (editingFollowUp) {
        await updateFollowUp.mutateAsync({
          followUpId: editingFollowUp.id,
          status: editingFollowUp.status,
          remarks: followUpForm.remarks.trim(),
          date: dateTimestamp,
          priority: followUpForm.priority,
          taskType: followUpForm.taskType,
          amount: editingFollowUp.amount,
        });
        toast.success('Follow-up updated successfully');
      } else {
        await createFollowUp.mutateAsync({
          leadId: BigInt(followUpForm.leadId),
          status: FollowUpStatus.pending,
          remarks: followUpForm.remarks.trim(),
          date: dateTimestamp,
          priority: followUpForm.priority,
          taskType: followUpForm.taskType,
          amount: BigInt(0),
        });
        toast.success('Follow-up created successfully');
      }

      setShowDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save follow-up');
    }
  };

  const handleMarkComplete = async (followUp: FollowUp) => {
    try {
      await updateFollowUp.mutateAsync({
        followUpId: followUp.id,
        status: FollowUpStatus.completed,
        remarks: followUp.remarks,
        date: followUp.date,
        priority: followUp.priority,
        taskType: followUp.taskType,
        amount: followUp.amount,
      });
      toast.success('Follow-up marked as completed');
    } catch (error) {
      toast.error('Failed to update follow-up');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Follow-Ups</CardTitle>
          <Button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Follow-Up
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.map((followUp) => {
                const isOverdue = followUp.status === FollowUpStatus.pending && Number(followUp.date) < now;
                return (
                  <TableRow key={followUp.id.toString()} className={isOverdue ? 'bg-destructive/5' : ''}>
                    <TableCell className="font-medium">{followUp.leadId.toString()}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive font-medium' : ''}>
                      {formatDate(followUp.date)}
                    </TableCell>
                    <TableCell>{followUp.priority}</TableCell>
                    <TableCell>{followUp.taskType}</TableCell>
                    <TableCell>{getStatusBadge(followUp.status, followUp.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{followUp.remarks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(followUp)}>
                          Edit
                        </Button>
                        {followUp.status === FollowUpStatus.pending && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkComplete(followUp)}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFollowUp ? 'Edit Follow-Up' : 'Add New Follow-Up'}</DialogTitle>
            <DialogDescription>Schedule a follow-up task for a lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="followup-lead">Lead *</Label>
              <Select
                value={followUpForm.leadId}
                onValueChange={(value) => setFollowUpForm({ ...followUpForm, leadId: value })}
                disabled={!!editingFollowUp}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id.toString()} value={lead.id.toString()}>
                      {lead.name} - {lead.mobile}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-date">Date *</Label>
              <Input
                id="followup-date"
                type="date"
                value={followUpForm.date}
                onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="followup-priority">Priority</Label>
                <Input
                  id="followup-priority"
                  value={followUpForm.priority}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followup-task-type">Task Type</Label>
                <Input
                  id="followup-task-type"
                  value={followUpForm.taskType}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, taskType: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-remarks">Remarks</Label>
              <Textarea
                id="followup-remarks"
                value={followUpForm.remarks}
                onChange={(e) => setFollowUpForm({ ...followUpForm, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createFollowUp.isPending || updateFollowUp.isPending}>
              {createFollowUp.isPending || updateFollowUp.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Follow-Up'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
