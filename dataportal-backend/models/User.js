const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  discordId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.discordId; // Only required for non-Discord users
    }
  },
  twoFactorCode: {
    type: String,
    default: '0000'
  },
  rank: {
    type: String,
    enum: ['standard', 'premium'],
    default: 'standard'
  },
  suspended: {
    type: Boolean,
    default: false
  },
  discordAvatar: {
    type: String
  },
  authType: {
    type: String,
    enum: ['local', 'discord'],
    default: 'local'
  }
}, {
  timestamps: true
});

// Transform to match frontend format
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  return {
    id: user._id.toString(),
    username: user.username,
    discordId: user.discordId,
    email: user.email,
    twoFactorCode: user.twoFactorCode,
    rank: user.rank,
    suspended: user.suspended,
    discordAvatar: user.discordAvatar,
    authType: user.authType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);
