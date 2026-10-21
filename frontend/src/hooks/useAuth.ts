import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/authContextDef';

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  registerCandidate: async () => {},
  logout: async () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
};

export default useAuth;
