import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AuthContext, type AuthContextType } from '../context/authContextDef';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  ...overrides,
});

describe('ProtectedRoute Component', () => {
  it('redirects unauthenticated users to /admin/login', () => {
    const mockAuth = createMockAuthContext({ isAuthenticated: false, isLoading: false });

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={['/admin/jobs']}>
          <Routes>
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute>
                  <div>Protected Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Admin Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    const mockAuth = createMockAuthContext({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ROLE_ADMIN',
        enabled: true,
        createdAt: '2026-10-20T00:00:00',
      },
      token: 'valid-jwt',
    });

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={['/admin/jobs']}>
          <Routes>
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute>
                  <div>Protected Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Admin Login Screen')).not.toBeInTheDocument();
  });

  it('displays loading indicator while auth status is being verified', () => {
    const mockAuth = createMockAuthContext({ isAuthenticated: false, isLoading: true });

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={['/admin/jobs']}>
          <ProtectedRoute>
            <div>Protected Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Verifying session.../i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Admin Content')).not.toBeInTheDocument();
  });
});
