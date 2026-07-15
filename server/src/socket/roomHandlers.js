const Room = require('../models/Room');

// Predefined cursor colors for users
const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA',
];

let colorIndex = 0;
const getNextColor = () => {
  const color = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
  colorIndex++;
  return color;
};

module.exports = (io, socket) => {
  // User joins a room
  socket.on('room:join', async ({ roomId, inviteCode, username }) => {
    try {
      const room = await Room.findOne({
        $or: [
          { _id: roomId },
          { inviteCode: inviteCode?.toUpperCase() },
        ],
      });

      if (!room) {
        socket.emit('room:error', { message: 'Room not found' });
        return;
      }

      const color = getNextColor();
      const userObj = {
        username,
        socketId: socket.id,
        color,
        joinedAt: new Date(),
      };

      // Add user to room in DB
      await Room.findByIdAndUpdate(room._id, {
        $push: { activeUsers: userObj },
        $addToSet: { participants: username },
        isActive: true,
      });

      // Join the socket.io room
      socket.join(room._id.toString());
      socket.roomId = room._id.toString();
      socket.username = username;
      socket.userColor = color;

      // Send room data to the joining user
      const updatedRoom = await Room.findById(room._id);
      socket.emit('room:joined', {
        room: updatedRoom,
        color,
      });

      // Notify others in the room
      socket.to(room._id.toString()).emit('room:user-joined', {
        username,
        color,
        socketId: socket.id,
      });

      console.log(`👤 ${username} joined room ${room.inviteCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('room:error', { message: 'Failed to join room' });
    }
  });

  // User leaves a room
  socket.on('room:leave', async () => {
    await handleUserLeave(socket);
  });

  // Chat message
  socket.on('chat:message', async ({ message }) => {
    if (!socket.roomId || !socket.username) return;

    const chatMsg = {
      username: socket.username,
      message,
      timestamp: new Date(),
    };

    // Save to DB
    await Room.findByIdAndUpdate(socket.roomId, {
      $push: { chat: chatMsg },
    });

    // Broadcast to room (including sender)
    io.to(socket.roomId).emit('chat:message', chatMsg);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    await handleUserLeave(socket);
  });
};

async function handleUserLeave(socket) {
  if (!socket.roomId) return;

  try {
    // Remove user from room in DB and get the updated document
    const updatedRoom = await Room.findByIdAndUpdate(
      socket.roomId,
      { $pull: { activeUsers: { socketId: socket.id } } },
      { new: true }
    );

    if (updatedRoom) {
      // Notify others
      socket.to(socket.roomId).emit('room:user-left', {
        username: socket.username,
        socketId: socket.id,
      });

      console.log(`👤 ${socket.username} left room`);

      // If no active users left, mark room as inactive and save closedAt
      if (updatedRoom.activeUsers.length === 0) {
        updatedRoom.isActive = false;
        updatedRoom.closedAt = new Date();
        await updatedRoom.save();
        console.log(`🏠 Room ${updatedRoom.inviteCode} is now inactive (0 active users)`);
      }
    }

    socket.leave(socket.roomId);
    socket.roomId = null;
  } catch (error) {
    console.error('Error handling user leave:', error);
  }
}
