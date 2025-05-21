// =============================================================================
// backend/utils/generateToken.js
// Utility function to generate JWT
// =============================================================================
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId, username) => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export default generateToken;