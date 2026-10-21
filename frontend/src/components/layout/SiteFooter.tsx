import React from 'react';
import { PageContainer } from '../ui/PageContainer';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-canvas-border bg-canvas-card py-12 transition-colors">
      <PageContainer size="wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo-badge.png"
                alt="Find My Job"
                className="w-12 h-12 rounded-full object-contain shadow-subtle"
              />
              <div>
                <span className="font-bold text-ink-900 text-base block">Find My Job</span>
                <span className="text-xs text-ink-500">Verified Job Discovery Platform</span>
              </div>
            </div>
            <p className="text-ink-500 leading-relaxed max-w-sm">
              An editorial, high-integrity discovery board for verified technology opportunities. Direct external applications with transparent salary data.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">Explore</h4>
            <ul className="space-y-1.5 text-ink-500">
              <li><a href="/jobs" className="hover:text-brand-600 transition-colors">All Opportunities</a></li>
              <li><a href="/categories" className="hover:text-brand-600 transition-colors">Job Categories</a></li>
              <li><a href="/about" className="hover:text-brand-600 transition-colors">About Find My Job</a></li>
              <li><a href="/jobs?workMode=REMOTE" className="hover:text-brand-600 transition-colors">Remote Positions</a></li>
              <li><a href="/jobs?type=INTERNSHIP" className="hover:text-brand-600 transition-colors">Internships</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-ink-500">
              <li><a href="/about" className="hover:text-brand-600 transition-colors">About Us</a></li>
              <li><span className="text-ink-400">Contact: support@findmyjob.com</span></li>
              <li><span className="text-ink-400">Terms of Service (Draft)</span></li>
              <li><span className="text-ink-400">Privacy Policy (Draft)</span></li>
              <li><a href="/admin/login" className="hover:text-brand-600 transition-colors">Admin Dashboard</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-canvas-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <p>&copy; {new Date().getFullYear()} Find My Job. All rights reserved. Notice: Legal terms and contact details are placeholder drafts.</p>
          <p className="text-[11px]">Production Job Discovery Engine</p>
        </div>
      </PageContainer>
    </footer>
  );
};
