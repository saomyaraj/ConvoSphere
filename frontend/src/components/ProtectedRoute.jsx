// =============================================================================
// frontend/src/components/ProtectedRoute.jsx
// Redirects to login if user is not authenticated
// =============================================================================
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner while checking auth status
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If authenticated, render the child routes (Outlet)
  // Otherwise, redirect to the login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;