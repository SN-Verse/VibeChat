import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import { io } from "socket.io-client";

// create Express app and HTTP server

const app = express()
const server = http.createServer(app)

// intialize socket.io server
export const socketServer = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*', 
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

    // Emit online user to all connected clients
    socketServer.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        socketServer.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

// Middleweare Setup
app.use(express.json({limit:"4mb"}))
app.use(cors({
    origin: process.env.CLIENT_URL || '*', 
    credentials: true
}));

app.use("/api/status",(req,res)=> res.send("Server is live"))
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

// Connecct to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is running on :"+ PORT));