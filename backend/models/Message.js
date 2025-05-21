import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderUsername: {
      type: String, // Store username directly for faster rendering
      required: true,
    },
    // For regular room messages
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      // Not required (could be a private message)
    },
    // For private messages
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Not required (could be a room message)
    },
    receiverUsername: {
      type: String, // Store username directly
      // Not required (could be a room message)
    },
    // Flag to indicate if message is formatted (markdown)
    hasFormatting: {
      type: Boolean,
      default: false,
    },
    // If the message contains an image
    image: {
      type: String,
      default: null,
    },
    // Message read status (for private messages)
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster message retrieval
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;