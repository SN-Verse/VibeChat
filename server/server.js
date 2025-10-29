import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


// create Express app and HTTP server

const app = express()
app.disable('x-powered-by')
const server = http.createServer(app)

// intialize socket.io server
export const socketServer = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
    }
}) 

// store online user

export const userSocketMap = {}; // {userId:socker=tId}

//Socket.io connection handler

socketServer.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId]=socket.id;

    // Join VibeRoom
    socket.on("join-viberoom", (roomId) => {
        socket.join(roomId);
    });

    // Video sync events
    socket.on("video-action", ({ roomId, action, time }) => {
        socket.to(roomId).emit("video-action", { action, time });
    });

    // Typing indicator relay between users
    socket.on("typing", ({ to, isTyping }) => {
        if (!to || !userId) return;
        const targetSocket = userSocketMap[to];
        if (targetSocket) {
            socketServer.to(targetSocket).emit("userTyping", { from: userId, isTyping: !!isTyping });
        }
    });

    // Emit online user to all connected clients
    socketServer.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        socketServer.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

// Store socketServer and userSocketMap in app.locals for access in controllers
app.locals.socketServer = socketServer;
app.locals.userSocketMap = userSocketMap;

// Middleweare Setup
app.use(express.json({limit:"4mb"}))
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","token"]
}));

// Minimal security headers (no extra deps)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-XSS-Protection', '0');
    next();
});

app.use("/api/status",(req,res)=> res.send("Server is live"))
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
})

// Generic error handler to avoid leaking internals
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err?.message)
    res.status(500).json({ success: false, message: 'Internal server error' })
})

// Connecct to MongoDB
await connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, ()=> console.log("Server is running on :"+ PORT));