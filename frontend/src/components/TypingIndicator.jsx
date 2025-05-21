// =============================================================================
// frontend/src/components/TypingIndicator.jsx
// Displays who is currently typing
// =============================================================================
import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return <div className="h-6"></div>; // Placeholder for height consistency
  }

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers.slice(0, 2).join(', ')} and others are typing...`;
  }

  return (
    <div className="h-6 px-4 text-sm text-gray-500 italic animate-pulse">
      {text}
    </div>
  );
};

export default TypingIndicator;