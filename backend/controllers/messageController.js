import Message from '../models/Message.js';
import User from '../models/User.js';
import Room from '../models/Room.js';

// @desc    Send a message to a room
// @route   POST /api/messages/room/:roomId
// @access  Private
const sendRoomMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, hasFormatting, image } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }
    
    // Create message
    const message = await Message.create({
      content,
      sender: req.user._id,
      senderUsername: req.user.username,
      room: roomId,
      hasFormatting: hasFormatting || false,
      image: image || null
    });
    
    // Populate sender info for immediate return
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .lean();
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send Room Message Error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get room messages
// @route   GET /api/messages/room/:roomId
// @access  Private
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }
    
    // Get messages for the room with pagination
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();
    
    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ room: roomId });
    
    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error('Get Room Messages Error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Send a private message to a user
// @route   POST /api/messages/private/:userId
// @access  Private
const sendPrivateMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, hasFormatting, image } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Prevent sending message to self
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    // Create message
    const message = await Message.create({
      content,
      sender: req.user._id,
      senderUsername: req.user.username,
      receiver: userId,
      receiverUsername: recipient.username,
      hasFormatting: hasFormatting || false,
      image: image || null
    });
    
    // Populate sender info for immediate return
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .lean();
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send Private Message Error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get private messages with a user
// @route   GET /api/messages/private/:userId
// @access  Private
const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between the two users with pagination
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();
    
    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error('Get Private Messages Error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Get conversations (list of users you've messaged)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username avatar status')
      .populate('receiver', 'username avatar status')
      .lean();
    
    // Extract unique conversation partners
    const conversations = [];
    const userIds = new Set();
    
    messages.forEach(message => {
      let partnerId;
      let partner;
      
      if (message.sender._id.toString() === req.user._id.toString()) {
        partnerId = message.receiver._id;
        partner = message.receiver;
      } else {
        partnerId = message.sender._id;
        partner = message.sender;
      }
      
      // Only add unique users
      if (!userIds.has(partnerId.toString())) {
        userIds.add(partnerId.toString());
        
        // Count unread messages
        const unreadCount = messages.filter(
          m => m.sender._id.toString() === partnerId.toString() && 
               m.receiver._id.toString() === req.user._id.toString() &&
               !m.isRead
        ).length;
        
        conversations.push({
          _id: partnerId,
          username: partner.username,
          avatar: partner.avatar,
          status: partner.status,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount
        });
      }
    });
    
    res.json(conversations);
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

export {
  sendRoomMessage,
  getRoomMessages,
  sendPrivateMessage,
  getPrivateMessages,
  getConversations
};