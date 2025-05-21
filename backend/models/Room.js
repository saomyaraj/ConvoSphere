import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Room name must be at least 2 characters long'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on room name (for faster lookups)
roomSchema.index({ name: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;