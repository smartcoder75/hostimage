// Main Page Script - Handle Authentication State and Image Management

// Get base URL for full image links (works with Render hosting)
const getBaseUrl = () => {
  return window.location.origin; // e.g., https://your-app.onrender.com
};

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  checkAuthStatus();

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Setup image upload if user is authenticated
  if (apiClient.isAuthenticated()) {
    setupImageUpload();
    loadUserImages();
  }
});

// Check if user is authenticated and update UI
function checkAuthStatus() {
  const userProfile = document.getElementById('userProfile');
  const authButtons = document.getElementById('authButtons');
  const userName = document.getElementById('userName');
  const userInitial = document.getElementById('userInitial');

  if (apiClient.isAuthenticated()) {
    const userData = getUserData();
    
    if (userData) {
      // Show user profile, hide auth buttons
      if (userProfile) userProfile.style.display = 'flex';
      if (authButtons) authButtons.style.display = 'none';
      
      // Set username
      if (userName) userName.textContent = userData.username;
      
      // Set user initial
      if (userInitial) {
        userInitial.textContent = userData.username.charAt(0).toUpperCase();
      }
    }
  } else {
    // Show auth buttons, hide user profile
    if (userProfile) userProfile.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
  }
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    apiClient.logout();
  }
}

// Setup image upload functionality
function setupImageUpload() {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('file');
  const uploadBtn = document.getElementById('upload');

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleImageUpload();
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleImageUpload();
    });
  }
}

// Handle image upload
async function handleImageUpload() {
  const fileInput = document.getElementById('file');
  const result = document.getElementById('result');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    if (result) {
      result.textContent = 'Please select an image to upload';
      result.style.color = 'red';
    }
    showNotification('Please select an image to upload', 'error');
    return;
  }

  const file = fileInput.files[0];
  const description = '';
  const tags = '';
  const preview = document.getElementById('preview');
  const uploadBox = document.getElementById('uploadBox');

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    if (result) {
      result.textContent = 'Please upload a valid image file (JPG, PNG, or GIF)';
      result.style.color = 'red';
    }
    showNotification('Please upload a valid image file (JPG, PNG, or GIF)', 'error');
    return;
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    if (result) {
      result.textContent = 'File size must be less than 10MB';
      result.style.color = 'red';
    }
    showNotification('File size must be less than 10MB', 'error');
    return;
  }

  try {
    if (result) {
      result.textContent = 'Uploading...';
      result.style.color = 'blue';
    }
    showNotification('Uploading image...', 'info');
    
    const response = await apiClient.uploadImage(file, description, tags);
    
    // Generate full URL for sharing
    const fullImageUrl = getBaseUrl() + response.image.url;
    
    if (result) {
      result.innerHTML = `
        <div style="color: green; margin-bottom: 1rem;">
          ✅ File uploaded successfully!
        </div>
        <div class="link-display-box">
          <input type="text" id="uploadedImageLink" value="${fullImageUrl}" readonly style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px;">
          <button onclick="copyUploadedLink()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            📋 Copy Link
          </button>
        </div>
      `;
      result.style.color = 'green';
    }
    showNotification('Image uploaded successfully!', 'success');
    
    // Clear form
    if (fileInput) fileInput.value = '';
    if (preview) preview.innerHTML = '';
    if (uploadBox) {
      uploadBox.innerHTML = `
        <div class="upload-icon">📸</div>
        <div class="upload-text">Click to select an image or drag & drop</div>
        <div class="upload-subtext">PNG, JPG, GIF up to 10MB</div>
      `;
    }
    
    // Reload images
    await loadUserImages();
  } catch (error) {
    if (result) {
      result.textContent = 'Upload failed: ' + error.message;
      result.style.color = 'red';
    }
    showNotification(error.message || 'Failed to upload image', 'error');
  }
}

// Load user images
async function loadUserImages() {
  const galleryContainer = document.getElementById('userImagesGrid');
  const totalImages = document.getElementById('totalImages');
  const userDashboard = document.getElementById('userDashboard');
  
  if (!galleryContainer) return;

  // Show dashboard if user is logged in
  if (userDashboard && apiClient.isAuthenticated()) {
    userDashboard.style.display = 'block';
  }

  try {
    const images = await apiClient.getUserImages();
    console.log('Loaded images:', images);
    
    if (totalImages) {
      totalImages.textContent = images.length;
    }
    
    if (images.length === 0) {
      galleryContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1; font-size: 1.1rem; padding: 2rem;">No images uploaded yet. Upload your first image above!</p>';
      return;
    }

    // Clear existing content
    galleryContainer.innerHTML = '';

    // Create image cards
    images.forEach((image, index) => {
      console.log(`Creating card ${index + 1}:`, image);
      const imageCard = createImageCard(image);
      galleryContainer.appendChild(imageCard);
      console.log(`Card ${index + 1} appended to gallery`);
    });
    
    console.log('All image cards created successfully');
    
    // Setup event delegation for buttons
    setupButtonEventDelegation(galleryContainer, images);
  } catch (error) {
    console.error('Failed to load images:', error);
    showNotification('Failed to load images', 'error');
  }
}

// Setup event delegation for all buttons
function setupButtonEventDelegation(container, images) {
  console.log('Setting up event delegation...');
  
  // Remove old listener if exists
  const oldListener = container._clickListener;
  if (oldListener) {
    container.removeEventListener('click', oldListener);
  }
  
  // Create new listener
  const clickListener = function(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    const card = target.closest('.user-image-item');
    if (!card) return;
    
    const cardIndex = Array.from(container.children).indexOf(card);
    const image = images[cardIndex];
    
    if (!image) {
      console.error('Image not found for card index:', cardIndex);
      return;
    }
    
    const fullImageUrl = getBaseUrl() + image.url;
    const imageId = image.id || image._id;
    
    if (target.classList.contains('btn-copy')) {
      e.preventDefault();
      console.log('Copy button clicked via delegation!', fullImageUrl);
      copyImageLink(fullImageUrl);
    } else if (target.classList.contains('btn-download')) {
      e.preventDefault();
      console.log('Download button clicked via delegation!', image.url);
      downloadImage(image.url, image.originalName);
    } else if (target.classList.contains('btn-delete')) {
      e.preventDefault();
      console.log('Delete button clicked via delegation!', imageId);
      deleteImage(imageId);
    }
  };
  
  container.addEventListener('click', clickListener);
  container._clickListener = clickListener;
  console.log('Event delegation setup complete');
}

// Create image card element (simplified - using event delegation)
function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'user-image-item';
  
  card.innerHTML = `
    <img src="${image.url}" alt="${image.originalName}" loading="lazy">
    <div class="image-info">
      <h4>${image.originalName}</h4>
      <p>Uploaded: ${new Date(image.uploadedAt).toLocaleDateString()}</p>
      ${image.metadata && image.metadata.description ? `<p class="description">${image.metadata.description}</p>` : ''}
      ${image.metadata && image.metadata.tags && image.metadata.tags.length > 0 ? 
        `<div class="tags">${image.metadata.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>` 
        : ''}
      <div class="image-actions">
        <button class="btn-copy" title="Copy image link">
          📋 Copy Link
        </button>
        <button class="btn-download" title="Download image">
          ⬇️ Download
        </button>
        <button class="btn-delete" title="Delete image">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// Download image
function downloadImage(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Delete image
async function deleteImage(imageId) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return;
  }

  try {
    showNotification('Deleting image...', 'info');
    await apiClient.deleteImage(imageId);
    showNotification('Image deleted successfully!', 'success');
    await loadUserImages();
  } catch (error) {
    showNotification(error.message || 'Failed to delete image', 'error');
  }
}

// Search images
async function searchImages(query) {
  const galleryContainer = document.getElementById('galleryContainer');
  
  if (!galleryContainer) return;

  if (!query || query.trim() === '') {
    await loadUserImages();
    return;
  }

  try {
    const images = await apiClient.searchImages(query);
    
    if (images.length === 0) {
      galleryContainer.innerHTML = '<p class="no-images">No images found matching your search.</p>';
      return;
    }

    // Clear existing content
    galleryContainer.innerHTML = '';

    // Create image cards
    images.forEach(image => {
      const imageCard = createImageCard(image);
      galleryContainer.appendChild(imageCard);
    });
  } catch (error) {
    console.error('Search failed:', error);
    showNotification('Search failed', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  // Set color based on type
  if (type === 'success') {
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.background = '#f44336';
    notification.style.color = 'white';
  } else if (type === 'info') {
    notification.style.background = '#2196F3';
    notification.style.color = 'white';
  }

  // Add to page
  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Copy uploaded image link
function copyUploadedLink() {
  const linkInput = document.getElementById('uploadedImageLink');
  if (linkInput) {
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
      showNotification('✅ Link copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy:', err);
      showNotification('Failed to copy link', 'error');
    });
  }
}

// Copy image link from gallery
function copyImageLink(url) {
  console.log('copyImageLink called with URL:', url);
  
  navigator.clipboard.writeText(url).then(() => {
    console.log('Copy successful!');
    showNotification('✅ Image link copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Clipboard API failed:', err);
    // Fallback method for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Fallback copy successful!');
        showNotification('✅ Image link copied to clipboard!', 'success');
      } else {
        console.error('Fallback copy failed');
        showNotification('Failed to copy link', 'error');
      }
    } catch (err) {
      console.error('execCommand failed:', err);
      showNotification('Failed to copy link', 'error');
    }
    document.body.removeChild(textArea);
  });
}

// Make functions globally available
window.copyImageLink = copyImageLink;
window.copyUploadedLink = copyUploadedLink;
window.downloadImage = downloadImage;
window.deleteImage = deleteImage;

// Format file size helper
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Setup search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchImages(e.target.value);
    }, 500); // Debounce search by 500ms
  });
}
