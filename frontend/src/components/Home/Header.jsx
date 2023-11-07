import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function Header({ user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="px-6 py-3 shadow-lg flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">
          <span className="text-[#F6931F]">CHAT</span>{" "}
          <span className="text-[#503F3D]">ROOM</span>
        </h1>
      </div>
      <div>
        <span className="mr-4 text-lg text-gray-500">
          Hey! {user?.username}.
        </span>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Header;
