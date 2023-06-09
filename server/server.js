const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const path = require('path');

const fileUpload = require('./MiddleWare/UploadFiles');

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Data structure to store room names and associated users
const rooms = new Map();

const PORT = 5000;

app.use("/uploads/files", express.static(path.join("uploads", "files")));


app.get('/', (req, res) => {
  res.send('Running');
});

app.post('/uploadFile', fileUpload.single('pdf'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file provided.', data: null });
  }
  // File upload successful
  const filePath = file.filename;
  // Implement further processing or saving logic here
  res.status(200).json({ success: true, message: 'File uploaded successfully.', data: filePath });
});

function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    const socket = room.users.find((socket) => socket.id === socketId);
    if (socket) {
      return roomId;
    }
  }
  return null;
}


io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log('user just connected with id :' + socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });

  socket.on('checkRoom', () => {
    const roomId = findRoomBySocketId(socket.id);
    const isInRoom = roomId !== null;
    socket.emit('roomCheckResult', { isInRoom, roomId });
  });

  socket.on("joinRoom", (data) => {
    const { roomId, name } = data;

    // const existingUser = rooms.get(roomId)?.users.find((user) => user.name === name);

    // Join the specified room
    socket.join(roomId);
    // Store the room name and associated users
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: roomId,
        users: [{ id: socket.id, name, stream: { video: true, audio: true } }],
      });
    } else {
      const room = rooms.get(roomId);
      room.users.push({ id: socket.id, name, stream: { video: true, audio: true } });
      rooms.set(roomId, room);
    }

    console.log(rooms);

    // Broadcast the updated room details to all clients in the room
    io.to(roomId).emit("all users", rooms.get(roomId).users.map(socket => socket));
    // Broadcast the updated room details to all clients in the room
    // io.to(roomId).emit("roomDetails", rooms.get(roomId));

    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('sending signal', (payload) => {
    const { userToSignal, callerID, signalData } = payload;
    io.to(userToSignal).emit('user joined', { signal: signalData, callerID });
  });

  socket.on('send-message', ({ roomId, sender, message, time, isFile }, callback) => {

    try {
      console.log({ roomId, sender, message, time, isFile });
      io.to(roomId).emit('receive-message', { sender, message, time, isFile }); // Emit the message to all clients in the room

      callback(); // Invoke the callback function to acknowledge successful message sending
    } catch (error) {
      // Handle any errors that occurred during message sending
      console.error(error);
      callback(error); // Pass the error to the callback function
    }
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
