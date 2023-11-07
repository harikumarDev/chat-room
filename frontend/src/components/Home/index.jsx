import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddCircleOutline from "@mui/icons-material/Add";
import { UserServices } from "../../services/user";
import { getErrorMessage, roomTabs } from "../../utils/helper";
import { socket } from "../../services/socket";
import CreateRoom from "./helpers/CreateRoom";
import RoomCard from "./helpers/RoomCard";
import Header from "./Header";
import Chat from "./Chat";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [rooms, setRooms] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isConnected, setIsConnected] = useState(false); // Socket connection
  const [newRoom, setNewRoom] = useState("");
  const [open, setOpen] = useState(false); // Create Room Dialog
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.username) {
      setUser(user);
    } else {
      toast.error("Please enter a username");
      navigate("/");
    }
  }, [navigate]);

  // Connect to socket
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Rooms created and joined by user
  const getUserRooms = async () => {
    try {
      const { data } = await UserServices.getUserRooms(user._id);

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

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

  const createRoom = async (e) => {
    e.preventDefault();

    if (!newRoom) {
      toast.info("Please enter a room name");
      return;
    }

    try {
      const { data } = await UserServices.createRoom({
        name: newRoom.trim(),
        userId: user._id,
      });

      if (data.success) {
        setNewRoom("");
        await getUserRooms();
        setOpen(false);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

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
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header user={user} />

        <div className="flex-grow flex">
          <div className="w-1/2 md:w-1/4 lg:w-1/6 border-r-2 border-r-gray-300 flex flex-col">
            {/* Room options Section */}
            <div className="px-4 pt-5 pb-2 border-b-2 border-b-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rooms</h3>
              <div
                title="Create Room"
                className="hover:bg-gray-100 rounded-full"
                onClick={() => setOpen(true)}
              >
                <AddCircleOutline className="cursor-pointer text-orange-400" />
              </div>
            </div>
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
                    <span className="text-lg text-gray-500">
                      No rooms Joined or Created
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-40">
                  <span className="text-lg text-gray-500">Loading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-grow">
            {selectedRoom ? (
              <Chat user={user} room={selectedRoom} />
            ) : (
              <div className="flex items-center justify-center h-[70%]">
                <span className="text-lg text-gray-500">
                  Select a room to start chatting
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateRoom
        open={open}
        setOpen={setOpen}
        newRoom={newRoom}
        setNewRoom={setNewRoom}
        createRoom={createRoom}
      />
    </Fragment>
  );
}

export default Home;
