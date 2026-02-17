import { Button } from '@/components/ui/button';
import { SiWhatsapp } from 'react-icons/si';

interface WhatsAppLinkButtonProps {
  name: string;
  mobile: string;
}

export default function WhatsAppLinkButton({ name, mobile }: WhatsAppLinkButtonProps) {
  const handleClick = () => {
    const normalizedMobile = mobile.replace(/\s+/g, '');
    const message = encodeURIComponent(`Hello ${name}, this is VR Homes Infra...`);
    const url = `https://wa.me/${normalizedMobile}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="h-8 w-8 p-0">
      <SiWhatsapp className="h-4 w-4 text-green-600" />
    </Button>
  );
}
