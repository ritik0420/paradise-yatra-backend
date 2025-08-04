# Paradise Yatra Backend API

A comprehensive Node.js + Express backend with MongoDB for the Paradise Yatra travel website.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Travel Packages**: Complete CRUD operations for travel packages
- **Destinations**: Management of trending destinations
- **Blogs**: Travel blog and article management
- **Bookings**: Complete booking system with status management
- **Admin Panel**: Comprehensive admin dashboard with analytics
- **Search & Filtering**: Advanced search and filtering capabilities
- **Error Handling**: Robust error handling and validation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get single package
- `GET /api/packages/search` - Search packages
- `GET /api/packages/category/:category` - Get packages by category
- `POST /api/packages/:id/reviews` - Add review to package
- `POST /api/packages` - Create package (Admin)
- `PUT /api/packages/:id` - Update package (Admin)
- `DELETE /api/packages/:id` - Delete package (Admin)

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get single destination
- `GET /api/destinations/trending` - Get trending destinations
- `GET /api/destinations/search` - Search destinations
- `POST /api/destinations` - Create destination (Admin)
- `PUT /api/destinations/:id` - Update destination (Admin)
- `DELETE /api/destinations/:id` - Delete destination (Admin)

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get single blog
- `GET /api/blogs/featured` - Get featured blogs
- `GET /api/blogs/search` - Search blogs
- `POST /api/blogs/:id/like` - Like blog
- `POST /api/blogs` - Create blog (Admin)
- `PUT /api/blogs/:id` - Update blog (Admin)
- `DELETE /api/blogs/:id` - Delete blog (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/admin/all` - Get all bookings (Admin)
- `PUT /api/bookings/admin/:id/status` - Update booking status (Admin)
- `GET /api/bookings/admin/stats` - Get booking statistics (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/analytics` - Get analytics

## Database Models

### User
- Authentication and profile management
- Role-based access (user/admin)
- Password hashing with bcrypt

### Package
- Travel package information
- Pricing and discounts
- Reviews and ratings
- Booking capacity management

### Destination
- Trending destinations
- Visit count tracking
- Location and highlights

### Blog
- Travel articles and blogs
- SEO optimization
- View and like tracking

### Booking
- Complete booking system
- Traveler information
- Payment and status tracking
- Booking reference generation

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Custom error messages
- Proper HTTP status codes

## Security Features

- JWT authentication
- Password hashing
- Role-based access control
- CORS configuration
- Input validation
- SQL injection prevention (MongoDB)

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### File Structure
```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── server.js       # Main server file
├── package.json    # Dependencies
└── README.md       # Documentation
```

## Frontend Integration

The backend is configured to work with the Next.js frontend running on `http://localhost:3000`. CORS is properly configured to allow requests from the frontend.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | Required |
| JWT_SECRET | JWT secret key | Required |
| NODE_ENV | Environment mode | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 
