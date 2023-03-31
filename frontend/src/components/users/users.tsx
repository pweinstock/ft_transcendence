import React, { useState, useEffect } from "react";

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
  const user = usersData[1] || {};
  console.log("user.photo: %s", user.photo);
  const userImageUrl = `http://localhost:5000/users/image/${user.photo}`;

  return (
    <div>
      <img
        src={userImageUrl}
        alt="User"
        style={{ float: "left", width: "50%" }}
      />
      <pre
        style={{ color: "white", fontSize: "14px", marginLeft: "50%" }}
      >
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}

export default Users;