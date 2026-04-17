import 'dotenv/config';
import { createServer } from "http";                           // Node's http module
import { Server } from "socket.io";                           // socket.io
import connectRoomioDB from './db/index.js';
import app from './app.js';

const httpServer = createServer(app);                         // wrap express with http

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000                                        // close connection after 60s of inactivity
});

// Socket.io Logic 

const onlineUsers = new Map();                               // userId → socketId

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // 1. User comes online
    socket.on("user-online", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;                              // attach to socket for disconnect
        io.emit("online-users", Array.from(onlineUsers.keys())); // broadcast online list
        console.log(`User online: ${userId}`);
    });

    //2. Join a chat room 
    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    // 3. Leave a chat room 
    socket.on("leave-chat", (chatId) => {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });

    //  4. New message
    // Called after REST API saves the message — just broadcasts it
    socket.on("new-message", (message) => {
        const chatId = message.chat?._id || message.chat;
        if (!chatId) return;

        // Emit to everyone in the room EXCEPT the sender
        socket.to(chatId).emit("message-received", message);
        console.log(`Message in chat ${chatId} from ${message.sender?._id}`);
    });

    //5. Typing indicators
    socket.on("typing", (chatId) => {
        socket.to(chatId).emit("typing", chatId);
    });

    socket.on("stop-typing", (chatId) => {
        socket.to(chatId).emit("stop-typing", chatId);
    });

    // 6. Mark messages as seen
    socket.on("mark-seen", ({ chatId, userId }) => {
        socket.to(chatId).emit("messages-seen", { chatId, userId });
    });

    // 7. Disconnect
    socket.on("disconnect", () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit("online-users", Array.from(onlineUsers.keys()));
            console.log(`User offline: ${socket.userId}`);
        }
        console.log("Socket disconnected:", socket.id);
    });
});

// Start Server

connectRoomioDB()
    .then(() => {
        httpServer.listen(process.env.PORT || 8000, () => {   // httpServer not app.listen
            console.log(`Server running on port: ${process.env.PORT || 8000}`)
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err)
    })