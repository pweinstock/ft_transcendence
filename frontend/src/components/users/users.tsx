import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/users`, { credentials: "include" })
      .then((response) => {
        if (response.status === 401) {
          navigate('/auth');
        } else {
          return response.json();
        }
      })
      .then((data) => setUsersData(data))
      .catch((error) => console.error(error));
  }, []);

  function handleLogout() {
    fetch(`http://${window.location.hostname}:5000/auth/logout`, { credentials: "include" })
      .then(() => {
        navigate('/auth');
      })
      .catch((error) => console.error(error));
  }

  // Render the user's image and data
  const user = usersData[0] || {};
  const userImageUrl = `http://${window.location.hostname}:5000/users/image/${user.photo}`;



  return (
    <div>
      <img
        src={userImageUrl}
        alt="User"
        style={{ float: "left", width: "50%" }}
      />
      <pre style={{ color: "white", fontSize: "14px", marginLeft: "50%" }}>
        {JSON.stringify(usersData, null, 2)}
      </pre>
      <Button onClick={handleLogout} variant="contained">Logout</Button>
    </div>
  );
}

export default Users;
