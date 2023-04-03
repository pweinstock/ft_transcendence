import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

interface User {
  id: number;
  email: string;
  displayName: string;
  photo?: string;
  status: string;
  bannedUsers: any[];
  pendingFriends: any[];
  friends: any[];
  messages: any[];
  chats: any[];
  matchHistory: any[];
  wins: number;
  losses: number;
  draws: number;
  score: number;
  isTwoFactorAuthenticationEnabled: boolean;
  TwoFactorAuthenticationSecret: string | null;
}

function Users() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/users", { credentials: "include" })
      .then((response) => {
        if (response.status === 401) {
          window.location.href = "http://localhost:3000/auth";
        } else {
          return response.json();
        }
      })
      .then((data) => setUsersData(data))
      .catch((error) => console.error(error));
  }, []);

  // Render the user's image and data
  const user = usersData[0] || {};
  const userImageUrl = `http://localhost:5000/users/image/${user.photo}`;

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      <img
        src={userImageUrl}
        alt="User"
        style={{ float: "left", width: "50%" }}
      />
      <pre style={{ color: "white", fontSize: "14px", marginLeft: "50%" }}>
        {JSON.stringify(user, null, 2)}
      </pre>
      <Button
        variant="contained"
        onClick={handleOpenDialog}
        style={{ marginTop: "16px" }}
      >
        Open Dialog
      </Button>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>
          <p>Dialog content goes here</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Users;
