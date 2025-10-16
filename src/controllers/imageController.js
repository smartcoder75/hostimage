const multer = require('multer');
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const Image = require('../models/imageModel');
const Log = require('../models/logModel');
const { protect } = require('../middleware/auth');

// Use multer memory storage so we can write file buffer into GridFS
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpe?g|png|gif/;
    const ext = file.originalname.toLowerCase();
    if (filetypes.test(ext) && filetypes.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
  }
}).single('image');

// Helper to get native DB from mongoose
const getDb = () => mongoose.connection.db;

// @desc Upload image to GridFS and save metadata
// POST /api/images/upload
// private
const uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message || 'Upload error' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
      const db = getDb();
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { user: req.user ? req.user._id : null }
      });

      uploadStream.end(req.file.buffer);

      uploadStream.on('finish', async () => {
        const { description, tags } = req.body;
        // uploadStream.filename and uploadStream.id are available after finish
        const savedFileId = uploadStream.id; // ObjectId
        const savedFilename = uploadStream.filename || req.file.originalname;

        const image = await Image.create({
          user: req.user._id,
          filename: savedFilename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          fileId: savedFileId,
          metadata: {
            description: description || '',
            tags: tags ? tags.split(',').map(t => t.trim()) : []
          }
        });

        await Log.create({
          user: req.user._id,
          action: 'UPLOAD',
          details: `Uploaded image: ${req.file.originalname}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent') || ''
        });

        res.status(201).json({
          message: 'Image uploaded successfully',
          image: {
            id: image._id,
            filename: image.filename,
            originalName: image.originalName,
            url: `/api/images/file/${image.fileId}`,
            metadata: image.metadata,
            uploadedAt: image.uploadedAt
          }
        });
      });

      uploadStream.on('error', (streamErr) => {
        console.error('GridFS write error:', streamErr);
        res.status(500).json({ message: 'Error saving file' });
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// @desc    Get all images for a user
// @route   GET /api/images
// @access  Private
const getUserImages = async (req, res) => {
  try {
    const images = await Image.find({ user: req.user._id })
      .sort({ uploadedAt: -1 });
    
    res.json(images.map(image => ({
      id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      url: `/api/images/file/${image.fileId}`,
      metadata: image.metadata,
      uploadedAt: image.uploadedAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if user owns the image
    if (image.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this image' });
    }

    // Delete GridFS file by fileId
    try {
      const db = getDb();
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
      if (image.fileId) {
        await bucket.delete(new Types.ObjectId(image.fileId));
      }
    } catch (gfsErr) {
      console.error('Error deleting GridFS file:', gfsErr);
    }

    // Delete metadata document
    await Image.findByIdAndDelete(req.params.id);

    // Log the deletion
    await Log.create({
      user: req.user._id,
      action: 'DELETE',
      details: `Deleted image: ${image.originalName}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || ''
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search images
// @route   GET /api/images/search
// @access  Private
const searchImages = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const images = await Image.find({
      $and: [
        { user: req.user._id },
        {
          $or: [
            { originalName: { $regex: q, $options: 'i' } },
            { 'metadata.tags': { $regex: q, $options: 'i' } },
            { 'metadata.description': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).sort({ uploadedAt: -1 });

    res.json(images.map(image => ({
      id: image._id,
      filename: image.filename,
      originalName: image.originalName,
      url: `/api/images/file/${image.fileId}`,
      metadata: image.metadata,
      uploadedAt: image.uploadedAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stream a file stored in GridFS by fileId
const streamFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) return res.status(400).json({ message: 'File id required' });

    const db = getDb();
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const _id = new Types.ObjectId(fileId);
    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.contentType || 'application/octet-stream');
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    });

    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      res.sendStatus(404);
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Stream error:', error);
    res.sendStatus(404);
  }
};

module.exports = {
  uploadImage,
  getUserImages,
  deleteImage,
  searchImages,
  streamFile
};
