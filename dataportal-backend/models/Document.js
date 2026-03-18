const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    default: 'text'
  },
  fileType: {
    type: String
  },
  fileData: {
    type: String // Base64 encoded for small files
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  sharedWith: [{
    type: String // Array of usernames
  }]
}, {
  timestamps: true
});

// Transform to match frontend format
documentSchema.methods.toJSON = function() {
  const doc = this.toObject();
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    content: doc.content,
    type: doc.type,
    fileType: doc.fileType,
    fileData: doc.fileData,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    sharedWith: doc.sharedWith,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

module.exports = mongoose.model('Document', documentSchema);
