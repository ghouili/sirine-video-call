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

function findRoomBySocketId(id) {
  for (const room of rooms.values()) {
    const user = room.users.find((user) => user.id === id);
    if (user) {
      return user;
    }
  }
  return null; // User not found
}

function deleteUserFromRoom(roomId, name) {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.users = room.users.filter(user => user.name !== name);
    rooms.set(roomId, room);
  }
}


io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log('user just connected with id :' + socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });


  socket.on("joinRoom", ({ roomId, name, currentStream, socketId }) => {
    if (rooms.has(roomId)) {
      let chec = rooms.get(roomId);
      console.log( chec );
    }
    // Check if the socket.id already exists in the room
    const existingUser = rooms.has(roomId)
      ? rooms.get(roomId).users.find((user) => user.id === socketId)
      : undefined;

    if (existingUser) {
      return console.log(`User ${socketId} is already in room: ${roomId}`);

    } else {

      // Join the specified room
      socket.join(roomId);
      // Store the room name and associated users
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          name: roomId,
          users: [{ id: socketId, name, stream: { streamData: currentStream, video: true, audio: true } }],
        });
      } else {
        const room = rooms.get(roomId);
        room.users.push({ id: socketId, name, stream: { streamData: currentStream, video: true, audio: true } });
        rooms.set(roomId, room);
      }

    }
    // console.log(rooms);

    // Broadcast the updated room details to all clients in the room
    io.to(roomId).emit("all users", rooms.get(roomId));
    // Broadcast the updated room details to all clients in the room
    // io.to(roomId).emit("roomDetails", rooms.get(roomId));

    console.log(`User ${socketId} joined room: ${roomId}`);
  });


  socket.on("BE-call-user", ({ userToCall, from, signal }) => {
    // console.log("io.sockets.sockets.get(socket.id)  : -----------------");
    // console.log(io.sockets.sockets.get(socket.id));
    // console.log(signal);
    io.to(userToCall).emit("FE-receive-call", {
      signal,
      from,
      info: findRoomBySocketId(socket.id),
    });
  });


  socket.on("BE-accept-call", ({ signal, to }) => {
    io.to(to).emit("FE-call-accepted", {
      signal,
      answerId: socket.id,
    });
  });

  socket.on('sending signal', (payload) => {
    const { userToSignal, callerID, signalData } = payload;
    io.to(userToSignal).emit('user joined', { signal: signalData, callerID });
  });

  socket.on('send-message', ({ roomId, sender, message, time, isFile }, callback) => {

    try {
      // console.log({ roomId, sender, message, time, isFile });
      io.to(roomId).emit('receive-message', { sender, message, time, isFile }); // Emit the message to all clients in the room

      callback(); // Invoke the callback function to acknowledge successful message sending
    } catch (error) {
      // Handle any errors that occurred during message sending
      console.error(error);
      callback(error); // Pass the error to the callback function
    }
  });

  socket.on("BE-leave-room", ({ roomId, name }) => {
    deleteUserFromRoom(roomId, name)
    console.log(rooms);
    console.log(`${socket.id} left room ${roomId}`);
    socket.broadcast
      .to(roomId)
      .emit("FE-user-leave", { userId: socket.id, userName: name });
    socket.leave(roomId); // Leave the room using the socket itself
  });


});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
