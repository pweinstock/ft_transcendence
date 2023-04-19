import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListSubheader, ListItemButton, Button, Badge, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../BaseInterface";
import { Block, PersonRemove, Send } from "@mui/icons-material";

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
      const newFriend = pendingFriends.find((friend) => friend.id === id) as User;
      setPendingFriends(updatedPendingFriends);
      setFriends((friends) => [...friends, newFriend]);
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

  const handleRemoveFriend = (id : string) => {
    axios.get(`http://${window.location.hostname}:5000/users/deleteFriend/${id}`, { withCredentials: true })
    .then(() => {
      const updatedFriends = friends.filter((friend) => friend.id !== id);
      setFriends(updatedFriends);
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const handleBlockUser = (id : string) => {
    axios.get(`http://${window.location.hostname}:5000/users/ban/${id}`, { withCredentials: true })
    .then(() => {
      const updatedFriends = friends.filter((friend) => friend.id !== id);
      setFriends(updatedFriends);
    })
    .catch((error) => {
      console.error(error);
    });
  };

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
            {friend.status === "online" ? (
            <Tooltip title={"online"}>
              <Badge
                color="success"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                >
                <Avatar src={`http://${window.location.hostname}:5000/users/image/${friend.photo}`} />
              </Badge>
            </Tooltip>
            ) : (
              <Tooltip title={"offline"}>
              <Badge
                color="error"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                >
                <Avatar src={`http://${window.location.hostname}:5000/users/image/${friend.photo}`} />
              </Badge>
            </Tooltip>
            )}
          </ListItemAvatar>
          <ListItemText primary={friend.displayName} />
          <Button variant="contained" endIcon={<Send/>}>
          Send Message
          </Button>
          <Button variant="outlined" onClick={() => handleRemoveFriend(friend.id)} startIcon={<PersonRemove/>}>
          Remove from friends
          </Button>
          <Button variant="outlined" color="error" startIcon={<Block/>} onClick={() => handleBlockUser(friend.id)}>
          Block
          </Button>
        </ListItem>
      ))}
    </List>
    </>
  );
};

export default Friends;
