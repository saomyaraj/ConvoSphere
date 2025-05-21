// =============================================================================
// frontend/src/App.jsx
// Main application component: Sets up routing and context providers
// =============================================================================  
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // Wrap entire app in AuthProvider first
    <AuthProvider>
      {/* SocketProvider needs AuthContext, so it goes inside */}
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            {/* Default Route */}
            {/* Redirect root to login or chat depending on auth status */}
            <Route
              path="/"
              element={
                // Use a small component or logic here to check auth status from context
                // Note: This check might be slightly delayed due to context loading
                // ProtectedRoute handles the actual protection for /chat
                localStorage.getItem('authToken') ? (
                  <Navigate to="/chat" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

             {/* Catch-all for undefined routes (optional) */}
             <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;