// =============================================================================
// frontend/src/components/UserList.jsx
// Displays the list of currently online users
// =============================================================================
import React from 'react';
import { Users, User } from 'lucide-react'; // User icon for individual users

const UserList = ({ users }) => {
  return (
    <div className="w-full md:w-64 bg-gradient-to-b from-gray-100 to-gray-200 p-4 border-l border-gray-300 overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
        <Users size={20} className="mr-2 text-blue-600" />
        Online Users ({users.length})
      </h2>
      <ul className="space-y-2">
        {users.length > 0 ? (
          users.map((username, index) => (
            <li key={index} className="flex items-center text-gray-800 bg-white p-2 rounded-md shadow-sm animate-fade-in">
              <User size={16} className="mr-2 text-green-500" />
              <span className="truncate">{username}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic">No users online.</li>
        )}
      </ul>
    </div>
  );
};

export default UserList;