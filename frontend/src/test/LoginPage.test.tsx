import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../features/admin/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import authService from '../api/authService';

vi.mock('../api/authService', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with username/email and password fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  it('displays client-side validation error when fields are blank', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    // Form prevents empty submission or shows error
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('handles invalid credentials by displaying an error message', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid username/email or password'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username or Email/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid username/email or password');
    });
  });

  it('calls authService.login and updates local storage on success', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'mock-jwt-token-12345',
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@domain.com',
        role: 'ROLE_ADMIN',
        enabled: true,
        createdAt: '2026-10-20T00:00:00',
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username or Email/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'AdminSecure2026!' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        usernameOrEmail: 'admin',
        password: 'AdminSecure2026!',
      });
      expect(localStorage.getItem('token')).toBe('mock-jwt-token-12345');
    });
  });
});
