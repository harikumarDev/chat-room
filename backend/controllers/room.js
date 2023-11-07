const error = require("../utils/error");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const Room = require("../models/room");
const Message = require("../models/message");

const getRoomsToJoin = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.query;
  console.log("Get rooms to join: ", userId);

  if (!userId) {
    return error(res, next, "User id is required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return error(res, next, "User not found", 404);
  }

  const rooms = await Room.find({
    "users.user": { $ne: userId },
  }).populate("creator");

  res.status(200).json({
    success: true,
    rooms,
  });
});

const createRoom = catchAsyncErrors(async (req, res, next) => {
  let { name, userId } = req.body;
  console.log("Create room: ", name, userId);

  if (!name || !userId) {
    return error(res, next, "Name and user id are required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return error(res, next, "User not found", 404);
  }

  name = name.trim();
  const roomExists = await Room.findOne({ name });
  if (roomExists) {
    return error(res, next, "Room name already taken", 400);
  }

  const room = await Room.create({
    name,
    users: [
      {
        user: userId,
        readMessages: 0,
      },
    ],
    creator: userId,
  });

  res.status(201).json({
    success: true,
    room,
  });
});

const joinRoom = catchAsyncErrors(async (req, res, next) => {
  const { roomId, userId } = req.body;
  console.log("Join room: ", roomId, userId);

  if (!roomId || !userId) {
    return error(res, next, "Room id and user id are required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return error(res, next, "User not found", 404);
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return error(res, next, "Room not found", 404);
  }

  const userInRoom = room.users.find((id) => id === userId);
  if (userInRoom) {
    return error(res, next, "User already in room", 400);
  }

  room.users.push({
    user: userId,
    readMessages: 0,
  });
  await room.save();

  res.status(200).json({
    success: true,
    room,
  });
});

const getRoomMessages = catchAsyncErrors(async (req, res, next) => {
  const { roomId, userId } = req.query;
  console.log("Get room messages: ", roomId, userId);

  if (!roomId || !userId) {
    return error(res, next, "Room id and user id are required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return error(res, next, "User not found", 404);
  }

  const room = await Room.findOne({
    _id: roomId,
    "users.user": userId,
  });
  if (!room) {
    return error(res, next, "Room not found", 404);
  }

  const messages = await Message.find({ room: roomId }).populate("sender");

  res.status(200).json({
    success: true,
    messages,
  });
});

module.exports = {
  getRoomsToJoin,
  createRoom,
  joinRoom,
  getRoomMessages,
};
