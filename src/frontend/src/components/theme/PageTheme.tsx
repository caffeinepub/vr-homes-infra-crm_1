import { ReactNode } from 'react';

interface PageThemeProps {
  children: ReactNode;
  variant: 'login' | 'access-denied' | 'admin' | 'agent';
}

export default function PageTheme({ children, variant }: PageThemeProps) {
  const themeClass = `page-theme-${variant}`;
  
  return (
    <div className={themeClass}>
      {children}
    </div>
  );
}
