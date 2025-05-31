import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import {connectDB} from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io";

//create express app
const app = express();
const server = http.createServer(app);

//Initialize Socket.IO
export const io = new Server(server, {
    cors: {
        origin:"*"
    }
})

export const userSocketMap = {}; // {userId: socketId}

// Handle socket connection
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User connected: ${userId}`);
    if(userId) {
        userScoketMap[userId] = socket.id; // Map userId to socketId
    }
    //Emit online users to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userScoketMap));

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
        delete userScoketMap[userId]; // Remove userId from socket map
        io.emit("getOnlineUsers", Object.keys(userScoketMap)); // Emit updated online users
    });
});

// Middleware
app.use(express.json({limit: '5mb'}));
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is running!"));
app.use("/api/auth", userRouter);
app.use("api/messages",messageRouter);

//connect to MongoDB
await connectDB();

if(process.env.NODE_ENV !=="production" ){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
//export server for vercel
export default server;