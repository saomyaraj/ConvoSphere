// =============================================================================
// frontend/src/contexts/AuthContext.jsx
// Manages authentication state (user info, token)
// =============================================================================
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { _id, username }
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Stores JWT
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null); // Stores auth errors

  // --- Effects ---

  // Load token from local storage on initial mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Optionally: Verify token with backend here to ensure it's still valid
      // For simplicity, we assume the token is valid if it exists.
      // A better approach would be to have a /api/auth/me endpoint.
      // For now, decode the token (basic, doesn't verify signature)
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1])); // Basic decode
        setUser({ _id: decoded.id, username: decoded.username });
      } catch (e) {
        console.error("Error decoding token on load:", e);
        logout(); // Clear invalid token/user
      }
    }
    setLoading(false); // Finished initial check
  }, []);

  // --- Authentication Functions ---

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      setLoading(false);
      return true; // Indicate success
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
      return false; // Indicate failure
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { username, password });
      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      setLoading(false);
      return true; // Indicate success
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
      return false; // Indicate failure
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
    // Note: Socket disconnect is handled in SocketContext/ChatPage
  }, []);

  // --- Value Provided by Context ---
  const value = {
    user,
    token,
    isAuthenticated: !!token, // Boolean flag for convenience
    loading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null), // Function to clear error messages
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};