import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListSubheader, ListItemButton, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../BaseInterface";

interface BaseUserProps {
  currentUser: User;
}

const Friends: React.FC<BaseUserProps> = (props: BaseUserProps) => {
  const [friends, setFriends] = useState<User[]>([]);

  const getFriends = async () => {
    try {
      const promises = props.currentUser.pendingFriends.map((id) =>
        axios.get(`http://${window.location.hostname}:5000/users/id/${id}`, { withCredentials: true }).then((res) => res.data)
      );
      const friendsData = await Promise.all(promises);
      setFriends(friendsData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getFriends();
  }, [props.currentUser.pendingFriends]);

  const handleAcceptFriend = async (id: string) => {
    try {
      await axios.get(`http://${window.location.hostname}:5000/users/acceptFriend/${id}`, { withCredentials: true });
      const updatedFriends = friends.filter((friend) => friend.id !== id);
      setFriends(updatedFriends);
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeclineFriend = async (id: string) => {
    try {
      await axios.get(`http://${window.location.hostname}:5000/users/declineFriend/${id}`, { withCredentials: true });
      const updatedFriends = friends.filter((friend) => friend.id !== id);
      setFriends(updatedFriends);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <List
        sx={{ width: '100%', height: 'auto', bgcolor: 'background.paper' }}
        subheader={<ListSubheader>Friend Requests</ListSubheader>}
    >
      {friends.map((friend) => (
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
  );
};

export default Friends;
