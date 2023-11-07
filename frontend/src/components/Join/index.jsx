import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Paper, TextField, Button } from "@mui/material";
import { UserServices } from "../../services/user";
import { getErrorMessage } from "../../utils/helper";

function Join() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.username) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.info("Please enter a username");
      return;
    }

    setLoading(true);
    try {
      const { data } = await UserServices.joinUser({
        username: username.trim().toLowerCase(),
      });

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/chat");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Paper elevation={2} className="px-8 py-10 w-9/12 lg:w-3/12 text-center">
        <h1 className="text-2xl font-semibold">Join Chat</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={loading}
          >
            Join
          </Button>
        </form>
      </Paper>
    </div>
  );
}

export default Join;
