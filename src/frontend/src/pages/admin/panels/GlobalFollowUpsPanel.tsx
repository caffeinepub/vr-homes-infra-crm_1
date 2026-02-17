import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllFollowUps } from '../../../hooks/useQueries';
import { FollowUpStatus } from '../../../backend';
import { Loader2 } from 'lucide-react';

export default function GlobalFollowUpsPanel() {
  const { data: followUps = [], isLoading } = useGetAllFollowUps();

  const now = Date.now() * 1000000; // Convert to nanoseconds

  const pendingFollowUps = followUps.filter((f) => f.status === FollowUpStatus.pending && Number(f.date) >= now);
  const overdueFollowUps = followUps.filter((f) => f.status === FollowUpStatus.pending && Number(f.date) < now);
  const completedFollowUps = followUps.filter((f) => f.status === FollowUpStatus.completed);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Follow-Ups</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingFollowUps.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueFollowUps.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedFollowUps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFollowUps.map((followUp) => (
                  <TableRow key={followUp.id.toString()}>
                    <TableCell className="font-medium">{followUp.leadId.toString()}</TableCell>
                    <TableCell>{formatDate(followUp.date)}</TableCell>
                    <TableCell>{followUp.priority}</TableCell>
                    <TableCell>{followUp.taskType}</TableCell>
                    <TableCell>{getStatusBadge(followUp.status, followUp.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{followUp.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueFollowUps.map((followUp) => (
                  <TableRow key={followUp.id.toString()} className="bg-destructive/5">
                    <TableCell className="font-medium">{followUp.leadId.toString()}</TableCell>
                    <TableCell className="text-destructive font-medium">{formatDate(followUp.date)}</TableCell>
                    <TableCell>{followUp.priority}</TableCell>
                    <TableCell>{followUp.taskType}</TableCell>
                    <TableCell>{getStatusBadge(followUp.status, followUp.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{followUp.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedFollowUps.map((followUp) => (
                  <TableRow key={followUp.id.toString()}>
                    <TableCell className="font-medium">{followUp.leadId.toString()}</TableCell>
                    <TableCell>{formatDate(followUp.date)}</TableCell>
                    <TableCell>{followUp.priority}</TableCell>
                    <TableCell>{followUp.taskType}</TableCell>
                    <TableCell>{getStatusBadge(followUp.status, followUp.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{followUp.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
