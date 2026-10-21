import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import { Search, Menu, X, LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { PageContainer } from '../ui/PageContainer';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export interface SiteHeaderProps {
  siteName?: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  siteName = 'Find My Job',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 12);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Public navigation â€” no Admin button
  const navLinks = [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? 'rgba(250,248,245,0.92)' : 'rgba(250,248,245,0.7)',
        boxShadow: scrolled
          ? '0 1px 0 0 #E8E4DC, 0 4px 16px rgba(17,20,26,0.06)'
          : '0 1px 0 0 transparent',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-40 backdrop-blur-md"
    >
      <PageContainer size="wide">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label={`${siteName} Home`}>
            <img
              src="/logo-horizontal.png"
              alt={siteName}
              className="h-10 sm:h-11 w-auto max-w-[200px] object-contain transition-transform group-hover:scale-[1.02]"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Text fallback if logo image fails */}
            <div className="hidden items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-ink-900">{siteName}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`relative text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
                  isActive(link.href)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-canvas-subtle'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-brand-50 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* Authenticated candidate: show saved jobs / dashboard link */}
            {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
              <Link
                to="/candidate/dashboard"
                className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  isActive('/candidate/dashboard')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-canvas-subtle'
                }`}
              >
                My Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'ROLE_ADMIN' && (
                  <Link to="/admin/jobs">
                    <SecondaryButton size="sm" icon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                      Admin
                    </SecondaryButton>
                  </Link>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-subtle border border-canvas-border">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <span className="text-xs font-medium text-ink-700 max-w-[100px] truncate">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/candidate/login">
                  <SecondaryButton size="sm" icon={<UserIcon className="w-3.5 h-3.5" />}>
                    Sign In
                  </SecondaryButton>
                </Link>
                <Link to="/jobs">
                  <PrimaryButton size="sm" icon={<Search className="w-3.5 h-3.5" />}>
                    Find Jobs
                  </PrimaryButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="p-2.5 rounded-xl text-ink-800 hover:bg-canvas-subtle transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </PageContainer>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-canvas-border bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium px-4 py-3 rounded-xl transition-colors ${
                    isActive(link.href)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-ink-800 hover:bg-canvas-subtle'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'ROLE_CANDIDATE' && (
                <Link
                  to="/candidate/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium px-4 py-3 rounded-xl transition-colors ${
                    isActive('/candidate/dashboard')
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-ink-800 hover:bg-canvas-subtle'
                  }`}
                >
                  My Dashboard
                </Link>
              )}
            </div>

            <div className="px-4 pb-5 flex flex-col gap-2 border-t border-canvas-border pt-3">
              {isAuthenticated ? (
                <>
                  {user?.role === 'ROLE_ADMIN' && (
                    <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)}>
                      <SecondaryButton size="md" className="w-full" icon={<LayoutDashboard className="w-4 h-4" />}>
                        Admin Dashboard
                      </SecondaryButton>
                    </Link>
                  )}
                  <SecondaryButton
                    size="md"
                    className="w-full"
                    onClick={handleLogout}
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
                  </SecondaryButton>
                </>
              ) : (
                <>
                  <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>
                    <PrimaryButton size="md" className="w-full" icon={<Search className="w-4 h-4" />}>
                      Find Jobs
                    </PrimaryButton>
                  </Link>
                  <Link to="/candidate/login" onClick={() => setMobileMenuOpen(false)}>
                    <SecondaryButton size="md" className="w-full" icon={<UserIcon className="w-4 h-4" />}>
                      Sign In
                    </SecondaryButton>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};