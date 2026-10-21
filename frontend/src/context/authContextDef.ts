import { createContext } from 'react';
import type { LoginRequest, AuthState } from '../types/auth.types';
import type { CandidateRegisterRequest } from '../types/candidate.types';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  registerCandidate: (data: CandidateRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
