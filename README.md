# VibeChat 💬

<div align="center">

![VibeChat](https://img.shields.io/badge/VibeChat-Chat%20Application-blue)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node](https://img.shields.io/badge/Node.js-Latest-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-black)

A modern, real-time chat application with synchronized video watching capabilities. Connect with friends, send messages, and create VibeRooms to watch YouTube videos together in real-time.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## ✨ Features

### 💬 Real-time Messaging
- **Instant Messaging**: Send and receive messages in real-time using Socket.io
- **Image Sharing**: Share images and media files with your friends
- **Message Status**: See when your messages have been read
- **Message Deletion**: Delete messages for yourself or everyone

### 👥 Social Features
- **User Profiles**: Customize your profile with pictures and bio
- **Friend Management**: Send and accept friend requests
- **Friend List**: Keep track of all your connections
- **Online Status**: See who's currently online

### 🎬 VibeRoom
- **Synchronized Video Watching**: Watch YouTube videos together with friends in real-time
- **Video Sync**: Play, pause, and seek actions sync across all participants
- **Live Chat**: Chat with friends while watching videos
- **Room Invitations**: Invite up to 5 friends to join your VibeRoom
- **Embedded Player**: Seamless YouTube player integration

### 🎨 Modern UI/UX
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Animated Backgrounds**: Particle network effects for an engaging experience
- **Tailwind CSS**: Modern, utility-first styling
- **Toast Notifications**: User-friendly feedback system

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **React YouTube** - YouTube player integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Dotenv** - Environment variables

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or connection string)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VibeChat.git
cd VibeChat
```

### 2. Install Dependencies

#### Client
```bash
cd client
npm install
```

#### Server
```bash
cd server
npm install
```

### 3. Environment Variables

#### Server Environment (.env)
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

#### Client Environment (.env)
Create a `.env` file in the `client` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Start the Application

#### Terminal 1 - Start the Server
```bash
cd server
npm run server
```
The server will run on `http://localhost:5000`

#### Terminal 2 - Start the Client
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

---

## 💻 Usage

### Getting Started

1. **Register/Login**: Create a new account or login with existing credentials
2. **Set Up Profile**: Add a profile picture and bio
3. **Find Friends**: Search and send friend requests
4. **Start Chatting**: Select a friend from your list and start messaging
5. **Create VibeRoom**: 
   - Click on "VibeRoom" in the navigation
   - Paste a YouTube video URL
   - Invite friends (up to 5)
   - Start watching together!

### Features Overview

#### Chatting
- Click on any friend from the sidebar to open the chat
- Send text messages and images
- View message timestamps
- See online status of your friends

#### VibeRoom
- Create or join a VibeRoom
- Share YouTube videos with friends
- Video controls (play, pause, seek) sync automatically
- Use the live chat feature while watching

#### Profile Management
- Update your profile picture
- Edit your bio
- View your friend list and requests

---

## 📁 Project Structure

```
VibeChat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── RightSidebar.jsx
│   │   │   └── VibeRoom.jsx
│   │   ├── context/       # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── assets/        # Static assets
│   └── package.json
│
└── server/                # Node.js backend
    ├── controllers/       # Route controllers
    │   ├── userController.js
    │   └── messageController.js
    ├── models/            # Database models
    │   ├── User.js
    │   └── message.js
    ├── routes/            # API routes
    │   ├── userRoutes.js
    │   └── messageRoutes.js
    ├── middleware/        # Custom middleware
    │   └── auth.js
    ├── lib/               # Utility functions
    │   ├── db.js
    │   ├── cloudinary.js
    │   └── utils.js
    └── server.js          # Entry point
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/users` - Get all users
- `PATCH /api/auth/users/:id` - Update user profile
- `POST /api/auth/friend-request` - Send friend request
- `POST /api/auth/friend-request/accept` - Accept friend request
- `PATCH /api/auth/get-friends/:userId` - Get user's friends
- `GET /api/status` - Check server status

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/:userId/:secondId` - Get conversation
- `PATCH /api/messages/:messageId` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete a message

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **SN** - [GitHub](https://github.com/soumyajitnandi0)

---

## 🙏 Acknowledgments

- Socket.io for real-time communication
- React community for amazing tools
- YouTube for the embed API
- All contributors and supporters

---

<div align="center">

**Made with ❤️ using React and Node.js**

⭐ Star this repo if you found it helpful!

</div>
