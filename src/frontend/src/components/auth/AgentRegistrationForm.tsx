import { useState } from 'react';
import { useRegisterAsAgent } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AgentRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AgentRegistrationForm({ open, onOpenChange, onSuccess }: AgentRegistrationFormProps) {
  const registerAsAgent = useRegisterAsAgent();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !mobile.trim() || !photo) {
      toast.error('Please fill in all fields and upload a profile photo');
      return;
    }

    // Basic mobile validation
    if (!/^\+?[\d\s-()]+$/.test(mobile.trim())) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    try {
      const photoBytes = new Uint8Array(await photo.arrayBuffer());
      const photoBlob = ExternalBlob.fromBytes(photoBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await registerAsAgent.mutateAsync({
        name: name.trim(),
        mobile: mobile.trim(),
        photo: photoBlob,
      });

      toast.success('Registration submitted successfully! Awaiting admin approval.');
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message?.includes('Already registered')) {
        toast.error('You have already registered as an agent');
      } else {
        toast.error('Failed to submit registration. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Agent Registration</DialogTitle>
          <DialogDescription>
            Complete your agent registration. Your account will be reviewed by an administrator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name" className="text-sm font-medium">Full Name *</Label>
            <Input
              id="agent-name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              disabled={registerAsAgent.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-mobile" className="text-sm font-medium">Mobile Number *</Label>
            <Input
              id="agent-mobile"
              placeholder="+1 (555) 123-4567"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="h-10"
              disabled={registerAsAgent.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Include country code for international numbers
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-photo" className="text-sm font-medium">Profile Photo *</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={photoPreview} alt="Preview" />
                  <AvatarFallback>{name.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="agent-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-sm"
                  disabled={registerAsAgent.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading photo...</span>
                <span className="font-medium text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={registerAsAgent.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={registerAsAgent.isPending || !name.trim() || !mobile.trim() || !photo}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white"
          >
            {registerAsAgent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Registration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
