const Room = require("../models/room");
const Message = require("../models/message");

const addMessage = async (message) => {
  const { text, sender, room, time } = message;

  try {
    const newMessage = await Message.create({
      text,
      sender: sender._id,
      room: room._id,
      time,
    });

    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

const updateRoomMessages = async (userId, roomName, messages = 0) => {
  try {
    const room = await Room.findOne({
      name: roomName,
      "users.user": userId,
    });

    const newTotal = room.totalMessages + messages;

    await Room.findOneAndUpdate(
      { name: roomName, "users.user": userId },
      {
        $inc: { totalMessages: messages },
        $set: {
          "users.$.readMessages": newTotal,
        },
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addMessage,
  updateRoomMessages,
};
