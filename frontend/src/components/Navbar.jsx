// =============================================================================
// frontend/src/components/Navbar.jsx
// Simple navigation bar for the chat page
// =============================================================================
import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket'; // To potentially show connection status

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  const handleLogout = () => {
    logout();
    // Socket disconnect is handled automatically by SocketProvider/AuthContext changes
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold">ConvoSphere</div>
      <div className="flex items-center space-x-4">
         {/* Connection Status Indicator */}
         <span
           className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'} transition-colors duration-300`}
           title={isConnected ? 'Connected' : 'Disconnected'}
         ></span>
        {user && <span className="font-medium">Welcome, {user.username}!</span>}
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200 ease-in-out transform hover:-translate-y-0.5"
          title="Logout"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;