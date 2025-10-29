import dotenv from 'dotenv';
import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import http from "http";

// loading environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// attach socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    // credentials: true
  }
});

// handle new connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// helper to emit notifications from anywhere
export const sendNotification = (message) => {
  io.emit("notification", { message, timestamp: new Date() });
};

server.listen(PORT, () => {
  console.log(`Atlas Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.MONGODB_URI}`);
});
