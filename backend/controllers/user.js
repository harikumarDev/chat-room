const error = require("../utils/error");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const Room = require("../models/room");

const joinUser = catchAsyncErrors(async (req, res, next) => {
  let { username } = req.body;
  console.log("Join user: ", username);

  if (!username) {
    return error(res, next, "Please provide username", 401);
  }

  username = username.trim().toLowerCase();

  let user;
  user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username });

    return res.status(201).json({
      success: true,
      user,
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const getUserRooms = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.query;
  console.log("Get user rooms: ", userId);

  if (!userId) {
    return error(res, next, "User id is required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return error(res, next, "User not found", 404);
  }

  const rooms = await Room.find({
    "users.user": userId,
  }).populate("creator");

  res.status(200).json({
    success: true,
    rooms,
  });
});

module.exports = {
  joinUser,
  getUserRooms,
};
