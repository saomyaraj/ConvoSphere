// =============================================================================
// frontend/src/hooks/useAuth.js
// Custom hook to easily access AuthContext
// =============================================================================
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};