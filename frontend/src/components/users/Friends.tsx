import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListSubheader, ListItemButton, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../BaseInterface";

interface BaseUserProps {
  currentUser: User;
}

const Friends: React.FC<BaseUserProps> = (props: BaseUserProps) => {
  const [pendingFriends, setPendingFriends] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);

  const getPendingFriends = async () => {
    try {
      const promises = props.currentUser.pendingFriends.map((id) =>
        axios.get(`http://${window.location.hostname}:5000/users/id/${id}`, { withCredentials: true }).then((res) => res.data)
      );
      const pendingFriendsData = await Promise.all(promises);
      setPendingFriends(pendingFriendsData);
    } catch (error) {
      console.error(error);
    }
  };

  const getFriends = async () => {
    try {
      const promises = props.currentUser.friends.map((id) =>
        axios.get(`http://${window.location.hostname}:5000/users/id/${id}`, { withCredentials: true }).then((res) => res.data)
      );
      const friendsData = await Promise.all(promises);
      console.log("friendsData: %s", friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPendingFriends();
    getFriends();
  }, [props.currentUser.pendingFriends, props.currentUser.friends]);

  const handleAcceptFriend = async (id: string) => {
    try {
      await axios.get(`http://${window.location.hostname}:5000/users/acceptFriend/${id}`, { withCredentials: true });
      const updatedPendingFriends = pendingFriends.filter((friend) => friend.id !== id);
      const newFriend = pendingFriends.find((friend) => friend.id === id)

      setPendingFriends(updatedPendingFriends);
      //setFriends((friends) => [...friends, newFriend]);
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeclineFriend = async (id: string) => {
    try {
      await axios.get(`http://${window.location.hostname}:5000/users/declineFriend/${id}`, { withCredentials: true });
      const updatedPendingFriends = pendingFriends.filter((friend) => friend.id !== id);
      setPendingFriends(updatedPendingFriends);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
    <List
        sx={{ width: '100%', height: 'auto', bgcolor: 'background.paper' }}
        subheader={<ListSubheader>Friend Requests</ListSubheader>}
    >
      {pendingFriends.map((friend) => (
        <ListItem key={friend.id}>
          <ListItemAvatar>
            <Avatar src={`http://${window.location.hostname}:5000/users/image/${friend.photo}`} />
          </ListItemAvatar>
          <ListItemText primary={friend.displayName} />
          <Button variant="contained" onClick={() => handleAcceptFriend(friend.id)}>Accept</Button>
          <Button variant="outlined" onClick={() => handleDeclineFriend(friend.id)}>Decline</Button>
        </ListItem>
      ))}
    </List>
    <List
      sx={{ width: '100%', height: 'auto', bgcolor: 'background.paper' }}
      subheader={<ListSubheader>Friends</ListSubheader>}
    >
      {friends.map((friend) => (
        <ListItem key={friend.id}>
          <ListItemAvatar>
            <Avatar src={`http://${window.location.hostname}:5000/users/image/${friend.photo}`} />
          </ListItemAvatar>
          <ListItemText primary={friend.displayName} />
        </ListItem>
      ))}
    </List>
    </>
  );
};

export default Friends;
