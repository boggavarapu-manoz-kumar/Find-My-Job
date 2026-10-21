import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { PageContainer } from '../ui/PageContainer';
import { PrimaryButton } from '../ui/Button';

export interface SiteHeaderProps {
  siteName?: string;
  tagline?: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  siteName = 'Find My Job',
  tagline = 'Verified Job Discovery Platform',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Categories', href: '/#categories' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-canvas-border transition-colors">
      <PageContainer size="wide">
        <div className="h-20 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group" aria-label={`${siteName} Home`}>
            <img
              src="/logo-horizontal.png"
              alt={siteName}
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[320px] object-contain transition-transform group-hover:scale-[1.02]"
              onError={(e) => {
                // Fallback to stylized logo icon + text if needed
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback container if image fails to render */}
            <div className="hidden items-center gap-3">
              <img
                src="/logo-icon.png"
                alt=""
                className="w-12 h-12 object-contain rounded-button"
              />
              <div>
                <span className="text-xl font-bold tracking-tight text-ink-900 block leading-tight">
                  {siteName}
                </span>
                <span className="text-xs uppercase font-semibold text-ink-400 tracking-wider block">
                  {tagline}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-semibold px-4 py-2.5 rounded-button transition-all duration-150 ${
                      isActive
                        ? 'text-brand-600 bg-brand-50 shadow-xs'
                        : 'text-ink-700 hover:text-ink-950 hover:bg-canvas-subtle'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/jobs">
                <PrimaryButton size="md" className="font-semibold px-5 shadow-sm hover:shadow" icon={<Search className="w-4 h-4" />}>
                  Find Jobs
                </PrimaryButton>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2.5 rounded-button text-ink-800 hover:bg-canvas-subtle focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-canvas-border bg-canvas-card px-4 pt-2 pb-6 shadow-card"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-ink-800 px-3 py-2.5 rounded-button hover:bg-canvas-subtle transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>
                  <PrimaryButton size="md" className="w-full" icon={<Search className="w-4 h-4" />}>
                    Find Jobs
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
