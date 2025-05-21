// =============================================================================
// frontend/src/components/MessageInput.jsx
// Input field and send button for sending messages
// =============================================================================
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop }) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null); // Ref for typing timeout

  // Handle input changes and emit typing events
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Emit 'typing_start' immediately if not already typing
    if (!typingTimeoutRef.current) {
      onTypingStart();
    } else {
      // Clear existing timeout if user continues typing
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to emit 'typing_stop' after a delay (e.g., 1.5 seconds)
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
      typingTimeoutRef.current = null; // Reset ref after timeout
    }, 1500);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage(''); // Clear input field
      // Clear typing timeout and emit stop immediately on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onTypingStop();
    }
  };

   // Cleanup timeout on component unmount
   useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 border-t border-gray-300 flex items-center space-x-3 rounded-b-lg"
    >
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className={`p-3 rounded-full text-white transition duration-200 ease-in-out flex items-center justify-center
                    ${message.trim()
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-gray-400 cursor-not-allowed'}`}
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;