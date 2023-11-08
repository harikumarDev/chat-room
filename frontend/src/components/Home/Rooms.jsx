import React, { useState, useEffect, Fragment } from "react";
import { toast } from "react-toastify";
import { getErrorMessage, roomTabs } from "../../utils/helper";
import { UserServices } from "../../services/user";
import { socket } from "../../services/socket";
import RoomCard from "./helpers/RoomCard";

function Rooms(props) {
  const {
    user,
    selectedRoom,
    setSelectedRoom,
    rooms,
    setRooms,
    getUserRooms,
    isConnected,
  } = props;

  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (user?._id) {
      getUserRooms();
    }
  }, [user]);

  // Notify user if new message is received in a room
  useEffect(() => {
    if (!selectedRoom) return;

    socket.on("notify_room", (data) => {
      // Donot notify if user is in the room
      if (selectedRoom.name === data.room) return;

      setRooms((rooms) => {
        const index = rooms.findIndex((r) => r.name === data.room);
        if (index === -1) return rooms;

        const newRooms = [...rooms];
        newRooms[index].totalMessages += 1;

        return newRooms;
      });
    });

    return () => {
      socket.off("notify_room");
    };
  }, [selectedRoom]);

  // Rooms available to join
  const getRoomsToJoin = async () => {
    try {
      const { data } = await UserServices.getRoomsToJoin(user._id);

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const { data } = await UserServices.joinRoom({
        roomId,
        userId: user._id,
      });

      if (data.success) {
        await getRoomsToJoin();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleTabChange = async (id) => {
    if (id === selectedTab) return;

    setSelectedTab(id);
    setRooms(null);

    if (id === 0) {
      await getUserRooms();
    } else if (id === 1) {
      await getRoomsToJoin();
    }
  };

  const handleRoomChange = (room) => {
    if (selectedRoom?._id === room._id) return;

    // Leave previous room
    if (selectedRoom) {
      socket.emit("leave_room", {
        room: {
          name: selectedRoom.name,
          _id: selectedRoom._id,
        },
        userId: user._id,
      });
    }

    setSelectedRoom(room);
    setRooms((rooms) => {
      const index = rooms.findIndex((r) => r._id === room._id);
      if (index === -1) return rooms;

      const newRooms = [...rooms];
      newRooms[index].users = newRooms[index].users.map((u) => {
        if (u.user === user._id) {
          u.readMessages = newRooms[index].totalMessages;
        }
        return u;
      });

      return newRooms;
    });

    socket.emit("join_room", {
      roomName: room.name,
      userId: user._id,
    });
  };

  return (
    <Fragment>
      <div className="flex justify-between items-center border-b">
        {roomTabs.map((tab) => (
          <div
            key={tab.id}
            className={`px-4 py-2 text-center w-1/2 cursor-pointer border-b-2 transition-all ${
              selectedTab === tab.id
                ? "border-b-[#503F3D]"
                : "border-transparent"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      {/* Rooms List */}
      <div className="overflow-y-scroll no-scrollbar pt-3 flex-grow flex flex-col gap-1 bg-gray-100">
        {rooms && isConnected ? (
          rooms.length > 0 ? (
            rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                user={user}
                joinRoom={joinRoom}
                selectedRoom={selectedRoom}
                handleRoomChange={handleRoomChange}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-40">
              <span className="text-lg text-gray-500">No rooms available</span>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-40">
            <span className="text-lg text-gray-500">Loading...</span>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default Rooms;
