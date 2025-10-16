const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  // GridFS file id - the actual file is stored in MongoDB GridFS
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // legacy/local filesystem path (optional) - not required when using GridFS
  path: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
imageSchema.index({
  originalName: 'text',
  'metadata.tags': 'text',
  'metadata.description': 'text'
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
