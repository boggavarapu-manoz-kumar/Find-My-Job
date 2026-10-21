import React from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-900 selection:bg-brand-100 selection:text-brand-900">
      <SiteHeader />
      <main className="flex-1 py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};
