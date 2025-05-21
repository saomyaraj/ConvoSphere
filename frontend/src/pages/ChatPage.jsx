/* eslint-disable no-unused-vars */
// src/pages/ChatPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import Navbar from '../components/Navbar';
import TypingIndicator from '../components/TypingIndicator';
import UserList from '../components/UserList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatPage = () => {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); // now array of { userId, username }
  const [typingUsers, setTypingUsers] = useState([]);

  const [mode, setMode] = useState('global'); // 'global' | 'room' | 'private'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // fetch rooms once
  // socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('new_room_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('new_private_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('update_user_list', users => setOnlineUsers(users || []));
    socket.on('user_typing', ({ username }) =>
      setTypingUsers(prev => [...new Set([...prev, username])])
    );
    socket.on('user_stopped_typing', ({ username }) =>
      setTypingUsers(prev => prev.filter(u => u !== username))
    );

    socket.emit('request_user_list');

    return () => {
      socket.off('new_message');
      socket.off('new_room_message');
      socket.off('new_private_message');
      socket.off('update_user_list');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket, isConnected]);

  const handleSendMessage = useCallback(
    text => {
      if (!socket || !isConnected) return;
      const payload = { text, hasFormatting: true };

      if (mode === 'global') {
        socket.emit('chat_message', payload);
      } else if (mode === 'room' && selectedRoom) {
        socket.emit('room_message', { ...payload, roomId: selectedRoom._id });
      } else if (mode === 'private' && selectedUser) {
        socket.emit('private_message', {
          ...payload,
          toUserId: selectedUser.userId
        });
      }
    },
    [socket, isConnected, mode, selectedRoom, selectedUser]
  );

  const handleTypingStart = useCallback(() => {
    if (socket && isConnected) socket.emit('typing_start');
  }, [socket, isConnected]);
  const handleTypingStop = useCallback(() => {
    if (socket && isConnected) socket.emit('typing_stop');
  }, [socket, isConnected]);

  const switchToGlobal = () => {
    setMode('global');
    setSelectedRoom(null);
    setSelectedUser(null);
    setMessages([]);
  };
  const startPrivateChat = userObj => {
    setMode('private');
    setSelectedUser(userObj);
    setSelectedRoom(null);
    setMessages([]);
  };

  if (!isAuthenticated) {
    return <div className="h-screen flex items-center justify-center">Redirecting…</div>;
  }
  if (!socket) {
    return <div className="h-screen flex items-center justify-center">Initializing…</div>;
  }
  if (!isConnected) {
    return <div className="h-screen flex items-center justify-center">Connecting…</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white p-4 border-r overflow-y-auto">
          <button
            onClick={switchToGlobal}
            className={`w-full mb-2 p-2 rounded ${
              mode === 'global' ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            Global Chat
          </button>
          <h3 className="mt-4 mb-2 font-semibold">Users</h3>
          {onlineUsers
            .filter(u => u.username !== user.username)
            .map(u => (
              <div
                key={u.userId}
                onClick={() => startPrivateChat(u)}
                className={`p-2 rounded cursor-pointer ${
                  mode === 'private' && selectedUser?.userId === u.userId
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                {u.username}
              </div>
            ))}
        </aside>

        <main className="flex-1 flex flex-col bg-gray-50 shadow-lg rounded-lg m-4 overflow-hidden">
          <MessageList messages={messages} />
          <TypingIndicator typingUsers={typingUsers} />
          <MessageInput
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </main>

        <div className="hidden md:block md:w-64">
          <UserList users={onlineUsers.map(u => u.username)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
