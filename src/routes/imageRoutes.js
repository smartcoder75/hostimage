const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  uploadImage, 
  getUserImages, 
  deleteImage, 
  searchImages 
} = require('../controllers/imageController');
const { streamFile } = require('../controllers/imageController');

const router = express.Router();

// Protected routes
router.post('/upload', protect, uploadImage);
router.get('/', protect, getUserImages);
router.delete('/:id', protect, deleteImage);
router.get('/search', protect, searchImages);
// Public file streaming endpoint (serves image data stored in GridFS)
router.get('/file/:fileId', streamFile);

module.exports = router;
