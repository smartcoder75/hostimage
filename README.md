# Image Upload Application with MongoDB

A full-stack image upload and management application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- ✅ User authentication (Register/Login) with JWT
- ✅ Secure password hashing with bcrypt
- ✅ Image upload with metadata (description, tags)
- ✅ Image gallery with search functionality
- ✅ User activity logging
- ✅ RESTful API architecture
- ✅ MongoDB database for all data storage
- ✅ Responsive design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variables

### Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **Boxicons** - Icons

## Project Structure

```
Post image - Copy/
├── src/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── userController.js     # User authentication logic
│   │   └── imageController.js    # Image management logic
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── userModel.js          # User schema
│   │   ├── imageModel.js         # Image schema
│   │   └── logModel.js           # Activity log schema
│   ├── routes/
│   │   ├── userRoutes.js         # User API routes
│   │   └── imageRoutes.js        # Image API routes
│   └── server.js                 # Main application entry
├── public/
│   └── js/
│       ├── api-client.js         # Frontend API client
│       ├── auth.js               # Authentication UI logic
│       └── main.js               # Main page logic
├── uploads/                      # Uploaded images directory
├── image/                        # Static assets
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── index.html                    # Main page
├── userlog.html                  # Login/Signup page
├── style.css                     # Styles
├── API_DOCUMENTATION.md          # API documentation
└── README.md                     # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:\Users\coder\OneDrive\Desktop\Post image - Copy"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update the `.env` file with your MongoDB connection string:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   BASE_URL=http://localhost:3000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

4. **Create uploads directory** (if not exists)
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   node src/server.js
   ```
   
   Or use npm script:
   ```bash
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### User Registration
1. Click "Sign Up" button on the homepage
2. Fill in username, email, and password
3. Click "Sign Up" to create account
4. You'll be automatically logged in and redirected

### User Login
1. Click "Login" button on the homepage
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the homepage

### Upload Images
1. Make sure you're logged in
2. Navigate to the upload section
3. Select an image file (JPG, PNG, or GIF)
4. Optionally add description and tags
5. Click "Upload"
6. Image will appear in your gallery

### View Images
- All your uploaded images are displayed in the gallery
- Each image shows metadata (name, description, tags)
- You can download or delete images

### Search Images
- Use the search bar to find images by:
  - Original filename
  - Description
  - Tags

### Logout
- Click on your profile avatar
- Click "Logout" button

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Images
- `POST /api/images/upload` - Upload image (protected)
- `GET /api/images` - Get user's images (protected)
- `DELETE /api/images/:id` - Delete image (protected)
- `GET /api/images/search?q=query` - Search images (protected)

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Database Collections

### Users
Stores user account information with hashed passwords.

### Images
Stores image metadata and file information linked to users.

### Logs
Tracks user activities (login, logout, upload, delete, signup).

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ File type validation
- ✅ File size limits (10MB max)
- ✅ Input validation and sanitization
- ✅ CORS enabled
- ✅ Environment variables for sensitive data

## Development

### Running in Development Mode
```bash
NODE_ENV=development node src/server.js
```

### Running in Production Mode
```bash
NODE_ENV=production node src/server.js
```

### Testing MongoDB Connection
```bash
node test-server.js
```

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI in `.env` file
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB service is running (if using local MongoDB)

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Module Not Found Errors
- Run `npm install` to install all dependencies
- Check if `node_modules` directory exists

### Image Upload Fails
- Ensure `uploads` directory exists
- Check file size (must be < 10MB)
- Verify file type (JPG, PNG, GIF only)
- Make sure you're logged in

## Future Enhancements

- [ ] Image compression before upload
- [ ] Multiple image upload
- [ ] Image editing capabilities
- [ ] Social sharing features
- [ ] User profiles with avatars
- [ ] Image albums/collections
- [ ] Advanced search filters
- [ ] Rate limiting
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Admin dashboard
- [ ] Image analytics

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

**Note**: Remember to change the `JWT_SECRET` in production to a strong, random string and never commit your `.env` file to version control.
