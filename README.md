# Career Tracking Platform

A comprehensive Next.js application for tracking user career progress with admin oversight, real-time communication, and AI-powered career guidance.

## Features

### 🎯 Core Features
- **Dual Dashboard System**: Separate interfaces for users and administrators
- **Real-time Communication**: WebSocket-powered chat between admins and users
- **AI Career Assistant**: Intelligent chatbot for career guidance and role transitions
- **Career Tracking**: Timeline-based career progress monitoring
- **Email Notifications**: Automated email alerts for login and registration
- **CSV Management**: Bulk user import/export functionality

### 👥 User Features
- Profile management with skills and experience tracking
- Career timeline with achievements, promotions, and skill updates
- AI-powered career guidance chatbot
- Real-time chat with administrators
- Email notifications for account activities

### 🔧 Admin Features
- User management dashboard with delete functionality
- Real-time statistics and analytics
- CSV import/export for bulk user operations
- Live chat with all users
- User activity monitoring
- Broadcast messaging to all users

### 🤖 AI Capabilities
- Career transition guidance
- Skill development recommendations
- Industry trend insights
- Salary negotiation advice
- Leadership development tips

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Email**: Nodemailer
- **AI**: OpenAI GPT (optional)
- **File Processing**: CSV Parser

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mastercard-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local` and update the values:
   ```bash
   cp .env.local .env.local
   ```
   
   Update these variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `SMTP_USER` & `SMTP_PASS`: Email credentials (optional)
   - `OPENAI_API_KEY`: OpenAI API key (optional)

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. **Create Admin Account**
   - You'll need to manually create an admin user in MongoDB
   - Use the registration flow but change the `role` field to `'admin'`

2. **User Registration**
   - Users can register through the registration page
   - Or admins can bulk import users via CSV

### Admin Features

- **Dashboard**: View user statistics and recent activities
- **User Management**: View, delete users, import/export CSV files
- **Real-time Chat**: Communicate with users individually or broadcast to all

### User Features

- **Profile**: Update personal information and skills
- **Career Tracking**: Add career updates, achievements, and milestones
- **AI Assistant**: Get career advice and guidance
- **Admin Chat**: Communicate with administrators

## CSV Format for User Import

The CSV file should have these columns:
```
name,email,currentRole,experience,skills
John Doe,john@example.com,Data Scientist,Mid Level,Python;Machine Learning;SQL
Jane Smith,jane@example.com,Software Engineer,Senior,JavaScript;React;Node.js
```

- **skills**: Separate multiple skills with semicolons (;)
- **experience**: Entry Level, Junior, Mid Level, Senior, Lead
- **currentRole**: Any role title

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/register` - User registration

### User Endpoints
- `GET /api/user/career` - Get career history
- `POST /api/user/career` - Add career update
- `PUT /api/user/profile` - Update profile

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics
- `POST /api/admin/upload-csv` - Import users from CSV
- `GET /api/admin/export-csv` - Export users to CSV

### Other Endpoints
- `POST /api/chatbot` - AI career assistant
- `POST /api/email/send-notification` - Send email notifications
- `/api/socket` - WebSocket connection for real-time chat

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB` | Database name | `career_tracking` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | Optional |
| `SMTP_PASS` | Email password | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | `http://localhost:3000` |

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Ensure MongoDB is accessible
4. Set production environment variables

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: 'user' | 'admin',
  currentRole: String,
  experience: String,
  skills: [String],
  careerHistory: [CareerUpdate],
  activities: [Activity],
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

### Career Update Schema
```javascript
{
  title: String,
  description: String,
  type: 'achievement' | 'promotion' | 'skill' | 'project' | 'certification' | 'role_change',
  date: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the Mastercard Hackathon**
