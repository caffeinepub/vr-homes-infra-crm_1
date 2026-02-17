import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { useGetAgentLeads, useGetAgentOwners, useCreateLead, useCreateOwner } from '../../../hooks/useQueries';
import { PropertyType, LeadType } from '../../../backend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import WhatsAppLinkButton from '../../../components/whatsapp/WhatsAppLinkButton';

export default function AddLeadOwnerPanel() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const { data: leads = [] } = useGetAgentLeads(principal);
  const { data: owners = [] } = useGetAgentOwners(principal);
  const createLead = useCreateLead();
  const createOwner = useCreateOwner();

  const [leadForm, setLeadForm] = useState({
    name: '',
    mobile: '',
    propertyType: PropertyType.apartment,
    leadType: LeadType.sale,
    price: '',
    requirements: '',
  });

  const [ownerForm, setOwnerForm] = useState({
    name: '',
    mobile: '',
    propertyType: PropertyType.apartment,
    location: '',
    price: '',
    address: '',
    remarks: '',
  });

  const handleCreateLead = async () => {
    if (!leadForm.name.trim() || !leadForm.mobile.trim() || !principal) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createLead.mutateAsync({
        name: leadForm.name.trim(),
        mobile: leadForm.mobile.trim(),
        propertyType: leadForm.propertyType,
        leadType: leadForm.leadType,
        price: BigInt(leadForm.price || '0'),
        assignedAgent: principal,
        leadLevel: 'Hot',
        source: 'Agent',
        status: 'New',
        requirements: leadForm.requirements.trim() || null,
      });

      toast.success('Lead created successfully');
      setLeadForm({
        name: '',
        mobile: '',
        propertyType: PropertyType.apartment,
        leadType: LeadType.sale,
        price: '',
        requirements: '',
      });
    } catch (error) {
      toast.error('Failed to create lead');
    }
  };

  const handleCreateOwner = async () => {
    if (!ownerForm.name.trim() || !ownerForm.mobile.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createOwner.mutateAsync({
        name: ownerForm.name.trim(),
        mobile: ownerForm.mobile.trim(),
        propertyType: ownerForm.propertyType,
        location: ownerForm.location.trim(),
        verificationStatus: 'Pending',
        price: BigInt(ownerForm.price || '0'),
        agentCommission: BigInt(0),
        remarks: ownerForm.remarks.trim(),
        address: ownerForm.address.trim(),
      });

      toast.success('Owner created successfully');
      setOwnerForm({
        name: '',
        mobile: '',
        propertyType: PropertyType.apartment,
        location: '',
        price: '',
        address: '',
        remarks: '',
      });
    } catch (error) {
      toast.error('Failed to create owner');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add-lead">
        <TabsList>
          <TabsTrigger value="add-lead">Add Lead</TabsTrigger>
          <TabsTrigger value="add-owner">Add Owner</TabsTrigger>
          <TabsTrigger value="my-leads">My Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="my-owners">My Owners ({owners.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="add-lead" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="lead-price">Budget</Label>
                <Input
                  id="lead-price"
                  type="number"
                  value={leadForm.price}
                  onChange={(e) => setLeadForm({ ...leadForm, price: e.target.value })}
                />
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
              <Button onClick={handleCreateLead} disabled={createLead.isPending} className="w-full">
                {createLead.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Lead'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-owner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="owner-price">Demand</Label>
                <Input
                  id="owner-price"
                  type="number"
                  value={ownerForm.price}
                  onChange={(e) => setOwnerForm({ ...ownerForm, price: e.target.value })}
                />
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
              <Button onClick={handleCreateOwner} disabled={createOwner.isPending} className="w-full">
                {createOwner.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Owner'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-owners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
