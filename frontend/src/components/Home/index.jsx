import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddCircleOutline from "@mui/icons-material/Add";
import { UserServices } from "../../services/user";
import { getErrorMessage } from "../../utils/helper";
import { socket } from "../../services/socket";
import CreateRoom from "./helpers/CreateRoom";
import Header from "./Header";
import Rooms from "./Rooms";
import Chat from "./Chat";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [rooms, setRooms] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Socket connection
  const [newRoom, setNewRoom] = useState("");
  const [open, setOpen] = useState(false); // Create Room Dialog
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Check if user has joined
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
    if (!user?._id) return;

    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

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

  return (
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

          <Rooms
            user={user}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            rooms={rooms}
            setRooms={setRooms}
            getUserRooms={getUserRooms}
            isConnected={isConnected}
          />
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
      <CreateRoom
        open={open}
        setOpen={setOpen}
        newRoom={newRoom}
        setNewRoom={setNewRoom}
        createRoom={createRoom}
      />
    </div>
  );
}

export default Home;
