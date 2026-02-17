import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useGetAllLeads, useGetAllOwners, useCreateLead, useUpdateLead, useDeleteLead, useCreateOwner, useUpdateOwner, useDeleteOwner, useGetAllAgents } from '../../../hooks/useQueries';
import { PropertyType, LeadType, Lead, Owner } from '../../../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import WhatsAppLinkButton from '../../../components/whatsapp/WhatsAppLinkButton';

export default function MasterDataPanel() {
  const { data: leads = [], isLoading: leadsLoading } = useGetAllLeads();
  const { data: owners = [], isLoading: ownersLoading } = useGetAllOwners();
  const { data: agents = [] } = useGetAllAgents();

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const createOwner = useCreateOwner();
  const updateOwner = useUpdateOwner();
  const deleteOwner = useDeleteOwner();

  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    mobile: '',
    propertyType: PropertyType.apartment,
    leadType: LeadType.sale,
    price: '',
    assignedAgent: '',
    leadLevel: 'Hot',
    source: 'Website',
    status: 'New',
    requirements: '',
  });

  // Owner form state
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    mobile: '',
    propertyType: PropertyType.apartment,
    location: '',
    verificationStatus: 'Pending',
    price: '',
    agentCommission: '',
    remarks: '',
    address: '',
  });

  const resetLeadForm = () => {
    setLeadForm({
      name: '',
      mobile: '',
      propertyType: PropertyType.apartment,
      leadType: LeadType.sale,
      price: '',
      assignedAgent: '',
      leadLevel: 'Hot',
      source: 'Website',
      status: 'New',
      requirements: '',
    });
    setEditingLead(null);
  };

  const resetOwnerForm = () => {
    setOwnerForm({
      name: '',
      mobile: '',
      propertyType: PropertyType.apartment,
      location: '',
      verificationStatus: 'Pending',
      price: '',
      agentCommission: '',
      remarks: '',
      address: '',
    });
    setEditingOwner(null);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name,
      mobile: lead.mobile,
      propertyType: lead.propertyType,
      leadType: lead.leadType,
      price: lead.price.toString(),
      assignedAgent: lead.assignedAgent.toString(),
      leadLevel: lead.leadLevel,
      source: lead.source,
      status: lead.status,
      requirements: lead.requirements || '',
    });
    setShowLeadDialog(true);
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setOwnerForm({
      name: owner.name,
      mobile: owner.mobile,
      propertyType: owner.propertyType,
      location: owner.location,
      verificationStatus: owner.verificationStatus,
      price: owner.price.toString(),
      agentCommission: owner.agentCommission.toString(),
      remarks: owner.remarks,
      address: owner.address,
    });
    setShowOwnerDialog(true);
  };

  const handleSaveLead = async () => {
    if (!leadForm.name.trim() || !leadForm.mobile.trim() || !leadForm.assignedAgent) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingLead) {
        await updateLead.mutateAsync({
          leadId: editingLead.id,
          name: leadForm.name.trim(),
          mobile: leadForm.mobile.trim(),
          propertyType: leadForm.propertyType,
          leadType: leadForm.leadType,
          price: BigInt(leadForm.price || '0'),
          assignedAgent: Principal.fromText(leadForm.assignedAgent),
          leadLevel: leadForm.leadLevel,
          source: leadForm.source,
          status: leadForm.status,
          requirements: leadForm.requirements.trim() || null,
        });
        toast.success('Lead updated successfully');
      } else {
        await createLead.mutateAsync({
          name: leadForm.name.trim(),
          mobile: leadForm.mobile.trim(),
          propertyType: leadForm.propertyType,
          leadType: leadForm.leadType,
          price: BigInt(leadForm.price || '0'),
          assignedAgent: Principal.fromText(leadForm.assignedAgent),
          leadLevel: leadForm.leadLevel,
          source: leadForm.source,
          status: leadForm.status,
          requirements: leadForm.requirements.trim() || null,
        });
        toast.success('Lead created successfully');
      }
      setShowLeadDialog(false);
      resetLeadForm();
    } catch (error) {
      toast.error('Failed to save lead');
    }
  };

  const handleSaveOwner = async () => {
    if (!ownerForm.name.trim() || !ownerForm.mobile.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingOwner) {
        await updateOwner.mutateAsync({
          ownerId: editingOwner.id,
          name: ownerForm.name.trim(),
          mobile: ownerForm.mobile.trim(),
          propertyType: ownerForm.propertyType,
          location: ownerForm.location.trim(),
          verificationStatus: ownerForm.verificationStatus,
          price: BigInt(ownerForm.price || '0'),
          agentCommission: BigInt(ownerForm.agentCommission || '0'),
          remarks: ownerForm.remarks.trim(),
          address: ownerForm.address.trim(),
        });
        toast.success('Owner updated successfully');
      } else {
        await createOwner.mutateAsync({
          name: ownerForm.name.trim(),
          mobile: ownerForm.mobile.trim(),
          propertyType: ownerForm.propertyType,
          location: ownerForm.location.trim(),
          verificationStatus: ownerForm.verificationStatus,
          price: BigInt(ownerForm.price || '0'),
          agentCommission: BigInt(ownerForm.agentCommission || '0'),
          remarks: ownerForm.remarks.trim(),
          address: ownerForm.address.trim(),
        });
        toast.success('Owner created successfully');
      }
      setShowOwnerDialog(false);
      resetOwnerForm();
    } catch (error) {
      toast.error('Failed to save owner');
    }
  };

  const handleDeleteLead = async (leadId: bigint) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead.mutateAsync(leadId);
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleDeleteOwner = async (ownerId: bigint) => {
    if (!confirm('Are you sure you want to delete this owner?')) return;
    try {
      await deleteOwner.mutateAsync(ownerId);
      toast.success('Owner deleted successfully');
    } catch (error) {
      toast.error('Failed to delete owner');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Leads Management</CardTitle>
              <Button
                onClick={() => {
                  resetLeadForm();
                  setShowLeadDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id.toString()}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lead.mobile}
                            <WhatsAppLinkButton name={lead.name} mobile={lead.mobile} />
                          </div>
                        </TableCell>
                        <TableCell>{lead.leadType}</TableCell>
                        <TableCell>₹{Number(lead.price).toLocaleString()}</TableCell>
                        <TableCell>{lead.status}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditLead(lead)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(lead.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Owners Management</CardTitle>
              <Button
                onClick={() => {
                  resetOwnerForm();
                  setShowOwnerDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>
            </CardHeader>
            <CardContent>
              {ownersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.map((owner) => (
                      <TableRow key={owner.id.toString()}>
                        <TableCell className="font-medium">{owner.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {owner.mobile}
                            <WhatsAppLinkButton name={owner.name} mobile={owner.mobile} />
                          </div>
                        </TableCell>
                        <TableCell>{owner.location}</TableCell>
                        <TableCell>₹{Number(owner.price).toLocaleString()}</TableCell>
                        <TableCell>{owner.verificationStatus}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditOwner(owner)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOwner(owner.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            <DialogDescription>Fill in the lead details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name *</Label>
                <Input
                  id="lead-name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-mobile">Mobile *</Label>
                <Input
                  id="lead-mobile"
                  value={leadForm.mobile}
                  onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-property-type">Property Type</Label>
                <Select
                  value={leadForm.propertyType}
                  onValueChange={(value) => setLeadForm({ ...leadForm, propertyType: value as PropertyType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyType.apartment}>Apartment</SelectItem>
                    <SelectItem value={PropertyType.house}>House</SelectItem>
                    <SelectItem value={PropertyType.land}>Land</SelectItem>
                    <SelectItem value={PropertyType.commercial}>Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-type">Lead Type</Label>
                <Select
                  value={leadForm.leadType}
                  onValueChange={(value) => setLeadForm({ ...leadForm, leadType: value as LeadType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeadType.sale}>Sale</SelectItem>
                    <SelectItem value={LeadType.rent}>Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-price">Price</Label>
                <Input
                  id="lead-price"
                  type="number"
                  value={leadForm.price}
                  onChange={(e) => setLeadForm({ ...leadForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-agent">Assigned Agent *</Label>
                <Select
                  value={leadForm.assignedAgent}
                  onValueChange={(value) => setLeadForm({ ...leadForm, assignedAgent: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id.toString()} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-level">Lead Level</Label>
                <Input
                  id="lead-level"
                  value={leadForm.leadLevel}
                  onChange={(e) => setLeadForm({ ...leadForm, leadLevel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-source">Source</Label>
                <Input
                  id="lead-source"
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-status">Status</Label>
                <Input
                  id="lead-status"
                  value={leadForm.status}
                  onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-requirements">Requirements</Label>
              <Textarea
                id="lead-requirements"
                value={leadForm.requirements}
                onChange={(e) => setLeadForm({ ...leadForm, requirements: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLead} disabled={createLead.isPending || updateLead.isPending}>
              {createLead.isPending || updateLead.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Owner Dialog */}
      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOwner ? 'Edit Owner' : 'Add New Owner'}</DialogTitle>
            <DialogDescription>Fill in the owner details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">Name *</Label>
                <Input
                  id="owner-name"
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-mobile">Mobile *</Label>
                <Input
                  id="owner-mobile"
                  value={ownerForm.mobile}
                  onChange={(e) => setOwnerForm({ ...ownerForm, mobile: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner-property-type">Property Type</Label>
                <Select
                  value={ownerForm.propertyType}
                  onValueChange={(value) => setOwnerForm({ ...ownerForm, propertyType: value as PropertyType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyType.apartment}>Apartment</SelectItem>
                    <SelectItem value={PropertyType.house}>House</SelectItem>
                    <SelectItem value={PropertyType.land}>Land</SelectItem>
                    <SelectItem value={PropertyType.commercial}>Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-location">Location</Label>
                <Input
                  id="owner-location"
                  value={ownerForm.location}
                  onChange={(e) => setOwnerForm({ ...ownerForm, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-address">Address</Label>
              <Input
                id="owner-address"
                value={ownerForm.address}
                onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner-price">Price</Label>
                <Input
                  id="owner-price"
                  type="number"
                  value={ownerForm.price}
                  onChange={(e) => setOwnerForm({ ...ownerForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-commission">Commission</Label>
                <Input
                  id="owner-commission"
                  type="number"
                  value={ownerForm.agentCommission}
                  onChange={(e) => setOwnerForm({ ...ownerForm, agentCommission: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-verification">Verification</Label>
                <Input
                  id="owner-verification"
                  value={ownerForm.verificationStatus}
                  onChange={(e) => setOwnerForm({ ...ownerForm, verificationStatus: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-remarks">Remarks</Label>
              <Textarea
                id="owner-remarks"
                value={ownerForm.remarks}
                onChange={(e) => setOwnerForm({ ...ownerForm, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOwnerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOwner} disabled={createOwner.isPending || updateOwner.isPending}>
              {createOwner.isPending || updateOwner.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Owner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
