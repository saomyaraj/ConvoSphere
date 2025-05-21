import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Create a new chat room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  const { name, description, type } = req.body;
  
  try {
    // Check if room name already exists
    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: 'Room name already exists' });
    }
    
    // Create new room
    const room = await Room.create({
      name,
      description: description || '',
      type: type || 'public',
      creator: req.user._id,
      members: [req.user._id], // Add creator as first member
    });
    
    // Add room to user's joinedRooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { joinedRooms: room._id } }
    );
    
    res.status(201).json(room);
  } catch (error) {
    console.error('Room Creation Error:', error);
    res.status(500).json({ message: 'Server error during room creation' });
  }
};

// @desc    Get all public rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ type: 'public' })
      .select('name description type members createdAt')
      .populate('creator', 'username')
      .lean();
    
    // Add member count to each room
    const roomsWithMemberCount = rooms.map(room => ({
      ...room,
      memberCount: room.members.length,
      // Don't send full members array to client
      members: undefined
    }));
    
    res.json(roomsWithMemberCount);
  } catch (error) {
    console.error('Get Rooms Error:', error);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'username avatar status')
      .populate('creator', 'username _id');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Get Room Error:', error);
    res.status(500).json({ message: 'Server error fetching room' });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }
    
    // Add user to room members
    room.members.push(req.user._id);
    await room.save();
    
    // Add room to user's joinedRooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { joinedRooms: room._id } }
    );
    
    res.json({ message: 'Joined room successfully', roomId: room._id });
  } catch (error) {
    console.error('Join Room Error:', error);
    res.status(500).json({ message: 'Server error joining room' });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:id/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member
    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this room' });
    }
    
    // If user is creator and not the only member, reassign creator
    if (room.creator.equals(req.user._id) && room.members.length > 1) {
      // Find another member to be creator
      const newCreator = room.members.find(
        memberId => !memberId.equals(req.user._id)
      );
      room.creator = newCreator;
    } else if (room.creator.equals(req.user._id) && room.members.length === 1) {
      // If creator is the only member, delete the room
      await Room.findByIdAndDelete(req.params.id);
      
      // Remove room from user's joinedRooms
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { joinedRooms: room._id } }
      );
      
      return res.json({ message: 'Room deleted successfully' });
    }
    
    // Remove user from room members
    room.members = room.members.filter(
      memberId => !memberId.equals(req.user._id)
    );
    await room.save();
    
    // Remove room from user's joinedRooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { joinedRooms: room._id } }
    );
    
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave Room Error:', error);
    res.status(500).json({ message: 'Server error leaving room' });
  }
};

// @desc    Initialize default room
// @access  Private (internal function)
const initializeDefaultRoom = async () => {
  try {
    // Check if a default room exists
    const defaultRoomExists = await Room.findOne({ isDefault: true });
    
    if (!defaultRoomExists) {
      console.log('Creating default general room');
      // Create admin user if not exists
      let adminUser = await User.findOne({ username: 'admin' });
      
      if (!adminUser) {
        adminUser = await User.create({
          username: 'admin',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          status: 'online',
          statusMessage: 'System Administrator'
        });
      }
      
      // Create default room
      await Room.create({
        name: 'general',
        description: 'Welcome to the general chat room',
        type: 'public',
        creator: adminUser._id,
        members: [adminUser._id],
        isDefault: true
      });
      
      console.log('Default room created successfully');
    }
  } catch (error) {
    console.error('Error creating default room:', error);
  }
};

export {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  initializeDefaultRoom
};