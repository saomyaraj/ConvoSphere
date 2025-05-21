# ConvoSphere

ConvoSphere is a modern real-time chat application built with React and Node.js, featuring instant messaging, user presence indicators, and live typing notifications.

## 🌟 Features

- **Real-time Communication**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication system
- **Live User Presence**: See who's currently online
- **Typing Indicators**: Real-time typing notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Message History**: Preserve chat history during session
- **Clean UI**: Modern and intuitive interface using Tailwind CSS
- **Server Messages**: System notifications for user join/leave events

## 🔧 Technology Stack

### Frontend

- React 18 with Hooks
- Socket.IO Client
- TailwindCSS for styling
- Vite for build tooling
- React Router for navigation
- Axios for HTTP requests
- Date-fns for time formatting
- Lucide React for icons

### Backend

- Node.js with Express
- Socket.IO for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS enabled
- Environment configuration with dotenv

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone <https://github.com/saomyaraj/ConvoSphere>
cd convosphere
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Configure backend environment:
   - Create a \`.env\` file in the backend directory
   - Add the following configuration:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ConvoSphere
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=<http://localhost:5173>
\`\`\`

4. Install frontend dependencies:
\`\`\`bash
cd ../frontend
npm install
\`\`\`

5. Configure frontend environment:
   - Create a \`.env\` file in the frontend directory
   - Add the following configuration:
\`\`\`env
VITE_WS_URL=<http://localhost:5000>
VITE_API_URL=<http://localhost:5000/api>
\`\`\`

### Running the Application

1. Start the backend server:
\`\`\`bash
cd backend
npm run dev
\`\`\`

2. Start the frontend development server:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The application will be available at:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected socket connections
- Secure password validation
- CORS protection
- Environment variable configuration

## 🎯 Key Components

- **Authentication System**: Complete user registration and login
- **Real-time Chat**: Instant message delivery and updates
- **User Status**: Online/offline status tracking
- **Message Formatting**: Timestamp formatting and message types
- **Error Handling**: Comprehensive error management
- **Responsive Layout**: Adaptive design for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/AmazingFeature\`
3. Commit your changes: \`git commit -m 'Add some AmazingFeature'\`
4. Push to the branch: \`git push origin feature/AmazingFeature\`
5. Open a pull request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for the database
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for frontend tooling

## 🔮 Future Enhancements

- Private messaging
- File sharing
- Message reactions
- User profiles
- Message search
- Chat rooms
- Message persistence
- Rich text formatting
