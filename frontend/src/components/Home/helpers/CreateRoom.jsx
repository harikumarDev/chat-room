import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

function CreateRoom(props) {
  const { open, setOpen, newRoom, setNewRoom, createRoom } = props;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          margin: 0,
          paddingX: 2,
          paddingY: 1,
        }}
      >
        Create Room
      </DialogTitle>
      <form onSubmit={createRoom}>
        <DialogContent
          sx={{
            margin: 0,
            paddingY: 0,
            marginX: 1,
          }}
        >
          <TextField
            label="Room Name"
            variant="outlined"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            marginBottom: 1,
            marginRight: 2,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="outlined" color="warning" type="submit">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateRoom;
