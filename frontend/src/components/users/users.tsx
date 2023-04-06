import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Users() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/users`, { withCredentials: true })
      .then((response) => {
        setUsersData(response.data);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 401) {
          navigate('/auth');
        }
      });
  }, []);

  function handleLogout() {
    axios.get(`http://${window.location.hostname}:5000/auth/logout`, { withCredentials: true })
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