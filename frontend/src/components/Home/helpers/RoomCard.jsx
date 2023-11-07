import React from "react";
import { Button } from "@mui/material";

function RoomCard(props) {
  const { room, user, selectedRoom, joinRoom, handleRoomChange } = props;

  const isCreator = room.creator._id === user._id;
  const member = room.users.find((u) => u.user === user._id);

  return (
    <div
      key={room._id}
      className={`px-6 py-4 mx-3 my-1 rounded-xl transition-all bg-white flex justify-between items-center border-2 ${
        selectedRoom?._id === room._id
          ? "border-orange-600"
          : "border-transparent"
      } ${member && "cursor-pointer"}`}
      onClick={() => {
        if (member) {
          handleRoomChange(room);
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{room.name}</span>
        <span className="text-sm text-gray-500">
          {room.users.length} member
          {room.users.length > 1 && "s"}
        </span>
      </div>
      <div className="text-right flex flex-col">
        {isCreator && (
          <span className="text-sm text-gray-400">You created this room</span>
        )}

        {member ? (
          <div>
            {room.totalMessages - member.readMessages > 0 && (
              <span className="text-sm bg-orange-700 text-white rounded-full px-2 py-1">
                {room.totalMessages - member.readMessages}
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => joinRoom(room._id)}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoomCard;
