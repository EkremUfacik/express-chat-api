import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import { Server } from "socket.io";

dotenv.config();

connectDB();

const app = express();

const server = createServer(app);

app.use(
  cors({
    credentials: true,
    origin: "https://next-chats-app.vercel.app",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

app.get("/", (req, res) => {
  res.json({ api: "API is running...." });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const io = new Server(server, {
  cors: {
    origin: "https://next-chats-app.vercel.app",
  },
});

io.on("connection", (socket) => {
  console.log("Connected socket.io");
  socket.on("setup", (id) => {
    socket.join(id);
    socket.emit("connected");
    console.log(`Connected ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected ${socket.id}`);
  });

  socket.on("join chat", (room) => {
    console.log(`Joined room ${room}`);
    socket.join(room);
  });

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user: any) => {
      if (user._id == newMessage.sender._id) return;
      socket.to(user._id).emit("new message", newMessage);
      console.log("New message sending");
    });
  });

  socket.on("is typing", (room) => {
    socket.to(room).emit("is typing");
  });

  socket.on("stopped typing", (room) => {
    socket.to(room).emit("stopped typing");
  });

  socket.off("setup", (id) => {
    socket.leave(id);
    socket.emit("disconnected setup");
  });
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
