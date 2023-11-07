import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SendIcon from "@mui/icons-material/Send";
import { socket } from "../../services/socket";
import { getDateAndTime, getErrorMessage } from "../../utils/helper";
import { UserServices } from "../../services/user";
import Messages from "./helpers/Messages";

function Chat({ user, room }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage) return;
    const message = {
      text: newMessage,
      sender: {
        _id: user._id,
        username: user.username,
      },
      room: {
        _id: room._id,
        name: room.name,
      },
      time: getDateAndTime(),
    };

    socket.emit("send_message", message);
    setMessages((msgs) => [...msgs, message]);
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("receive_message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const getRoomMessages = async () => {
    try {
      const { data } = await UserServices.getRoomMessages(room._id, user._id);

      if (data.success) {
        setMessages(data.messages);
        setNewMessage("");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (room?._id) {
      getRoomMessages();
    }
  }, [room]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 px-4 pt-3 border-b-2 border-gray-300 flex items-center justify-between gap-1">
        <div className="flex flex-col">
          <span className="font-semibold">{room.name}</span>
          <span className="text-sm text-orange-400">
            {room.users.length} member
            {room.users.length > 1 && "s"}
          </span>
        </div>
        <div>
          {room.creator._id === user._id && (
            <span className="text-sm text-gray-400">You created this room</span>
          )}
        </div>
      </div>

      <div className="flex-grow h-1 bg-gray-50 p-5 px-10 flex flex-col gap-2 overflow-y-scroll">
        <h2 className="text-gray-500 text-center">
          Created by{" "}
          <span className="font-semibold text-gray-600">
            {room.creator.username}
          </span>{" "}
          on {getDateAndTime(room.createdAt)}
        </h2>
        <Messages messages={messages} user={user} />
      </div>

      <div className="pb-8 px-8 bg-gray-50">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            className="outline-none border border-gray-400 px-4 p-1 flex-1 text-lg rounded-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoFocus
          />
          <div className="mx-2 mt-1">
            <button
              type="submit"
              className="bg-orange-600 text-white text-center rounded-full px-4 pb-1 pt-0.5"
            >
              <SendIcon className="mb-[0.5] -mr-1.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
