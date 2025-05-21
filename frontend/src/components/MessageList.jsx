// =============================================================================
// frontend/src/components/MessageList.jsx
// Displays the list of chat messages
// =============================================================================
import React, { useRef, useEffect } from 'react';
import { formatMessageTimestamp } from '../utils/formatDate';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth'; // To identify user's own messages

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom
  const { user } = useAuth(); // Get current user info

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-white rounded-t-lg shadow-inner">
      <ul className="space-y-4">
        {messages.map((msg) => {
          const isOwnMessage = msg.username === user?.username;
          const isServerMessage = msg.type === 'server'; // Check for server messages

          return (
            <li
              key={msg.id} // Use message ID as key
              className={`flex flex-col animate-slide-up ${
                isServerMessage
                  ? 'items-center' // Center server messages
                  : isOwnMessage
                  ? 'items-end' // Align user's messages to the right
                  : 'items-start' // Align others' messages to the left
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${
                  isServerMessage
                    ? 'bg-gray-200 text-gray-600 italic text-sm' // Style for server messages
                    : isOwnMessage
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' // Style for user's messages
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800' // Style for others' messages
                }`}
              >
                {/* Show username only for others' messages */}
                {!isOwnMessage && !isServerMessage && (
                  <p className="text-xs font-semibold mb-1 text-indigo-700">
                    {msg.username}
                  </p>
                )}
                {/* Message Text */}
                {msg.hasFormatting
                  ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                  : <p className="text-sm break-words">{msg.text}</p>
                }
              </div>
              {/* Timestamp - shown below the message bubble */}
               {!isServerMessage && (
                 <p className={`text-xs mt-1 ${isOwnMessage ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatMessageTimestamp(msg.timestamp)}
                 </p>
               )}
            </li>
          );
        })}
        {/* Empty div at the end to help scrolling */}
        <li ref={messagesEndRef} />
      </ul>
    </div>
  );
};

export default MessageList;