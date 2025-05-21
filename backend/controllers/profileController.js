import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('joinedRooms', 'name description');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Get user profile by ID or username
// @route   GET /api/profile/:identifier
// @access  Private
const getUserProfileByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is an ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    let query;
    if (isObjectId) {
      query = { _id: identifier };
    } else {
      query = { username: identifier };
    }
    
    const user = await User.findOne(query)
      .select('username avatar status statusMessage createdAt')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { avatar, status, statusMessage } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (avatar !== undefined) user.avatar = avatar;
    if (status !== undefined) user.status = status;
    if (statusMessage !== undefined) user.statusMessage = statusMessage;
    
    // Save updated user
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      statusMessage: user.statusMessage
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export {
  getUserProfile,
  getUserProfileByIdentifier,
  updateUserProfile
};