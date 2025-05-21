import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't send password back in queries by default
    },
    avatar: {
      type: String,
      default: '', // Will store URL or default avatar code
    },
    status: {
      type: String,
      default: 'online',
      enum: ['online', 'away', 'busy', 'offline'],
    },
    statusMessage: {
      type: String,
      default: '',
      maxlength: [100, 'Status message cannot exceed 100 characters'],
    },
    joinedRooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// --- Mongoose Middleware ---
// Hash password before saving a new user
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Mongoose Instance Methods ---
// Method to compare entered password with the hashed password in the DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Need to select('+password') when querying user if using this method
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate a default avatar based on username (first letter)
userSchema.pre('save', function(next) {
  if (!this.avatar && this.isNew) {
    // Generate a consistent color based on username
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF6'];
    const colorIndex = this.username.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Create avatar data with first letter and background color
    this.avatar = JSON.stringify({
      type: 'initial',
      text: this.username.charAt(0).toUpperCase(),
      bgColor: bgColor,
      textColor: '#FFFFFF'
    });
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;