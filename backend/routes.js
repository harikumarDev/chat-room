const express = require("express");
const User = require("./controllers/user");
const Room = require("./controllers/room");

const router = express.Router();

// User routes
router.post("/user/join", User.joinUser);
router.get("/user/rooms", User.getUserRooms);

// Room routes
router.get("/rooms/to-join", Room.getRoomsToJoin);
router.post("/room/create", Room.createRoom);
router.post("/room/join", Room.joinRoom);
router.get("/room/messages", Room.getRoomMessages);

module.exports = router;
