import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CandidateLoginPage } from '../features/candidate/CandidateLoginPage';
import { CandidateRegisterPage } from '../features/candidate/CandidateRegisterPage';
import { AuthContext } from '../context/authContextDef';

describe('Candidate Authentication UX', () => {
  const mockLogin = vi.fn();
  const mockRegisterCandidate = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            login: mockLogin,
            registerCandidate: mockRegisterCandidate,
            logout: mockLogout,
          }}
        >
          {ui}
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders candidate login form and validates blank inputs', async () => {
    renderWithAuth(<CandidateLoginPage />);

    expect(screen.getByText('Candidate Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    // Form prevents default or shows validation message
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits valid candidate login credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderWithAuth(<CandidateLoginPage />);

    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'candidate@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' },
    });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        usernameOrEmail: 'candidate@example.com',
        password: 'Password123!',
      });
    });
  });

  it('renders registration form and prevents submission with password < 8 characters', async () => {
    renderWithAuth(<CandidateRegisterPage />);

    expect(screen.getByText('Create Candidate Account')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'short' },
    });

    const createBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/i)
      ).toBeInTheDocument();
    });
    expect(mockRegisterCandidate).not.toHaveBeenCalled();
  });

  it('submits valid candidate registration form', async () => {
    mockRegisterCandidate.mockResolvedValueOnce(undefined);
    renderWithAuth(<CandidateRegisterPage />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'validuser' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'StrongPassword123!' },
    });

    const createBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockRegisterCandidate).toHaveBeenCalledWith({
        username: 'validuser',
        email: 'valid@example.com',
        password: 'StrongPassword123!',
      });
    });
  });
});
