import { Check, DoNotDisturb, DoNotDisturbOff, DoNotDisturbOffOutlined, PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar, Button, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { User } from "../BaseInterface";

interface BaseUserProps {
    currentUser : User;
}

const PublicProfile: React.FC<BaseUserProps> = (props : BaseUserProps) => {
	
    const [publicUser, setPublicUser] = useState<User>();
    const [isFriend, setIsFriend] = useState<boolean>(false)
    const [isBlocked, setIsBlocked] = useState<boolean>(false)
    const param = useParams();

    useEffect(() => {  
        axios.get(`http://${window.location.hostname}:5000/users/name/${param.user}`, { withCredentials: true })
          .then((response) => {
            setPublicUser(response.data);
            setIsFriend(props.currentUser.friends.includes(response.data.id));
            setIsBlocked(props.currentUser.bannedUsers.includes(response.data.id));
          })
          .catch((error) => {
            alert("User " + param.user + " does not exist!");
          });
        }, []);

    const handleAddFriend = () => {
      axios.get(`http://${window.location.hostname}:5000/users/addFriend/${publicUser?.id}`, { withCredentials: true })
      .then(() => {
        setIsFriend(true);
      })
      .catch((error) => {
        console.error(error);
      });
    };

    const handleRemoveFriend = () => {
      axios.get(`http://${window.location.hostname}:5000/users/deleteFriend/${publicUser?.id}`, { withCredentials: true })
      .then(() => {
        setIsFriend(false);
      })
      .catch((error) => {
        console.error(error);
      });
      };


    const handleBlockUser = (id : string | undefined) => {
      axios.get(`http://${window.location.hostname}:5000/users/ban/${id}`, { withCredentials: true })
      .then(() => {
        setIsBlocked(true);
      })
      .catch((error) => {
        console.error(error);
      });
    };

    const handleUnBlockUser = (id : string | undefined) => {
      axios.get(`http://${window.location.hostname}:5000/users/unban/${id}`, { withCredentials: true })
      .then(() => {
        setIsBlocked(false);
      })
      .catch((error) => {
        console.error(error);
      });
    };

	return (
    <>
      <Avatar  sx={{ width: 112, height: 112 }} src={`http://${window.location.hostname}:5000/users/image/${publicUser?.photo}`}/>
      {isFriend ? 
      <Tooltip title={"Remove " + publicUser?.displayName + " as a friend"}>
        <Button variant="outlined" onClick={handleRemoveFriend} startIcon={<PersonRemove/>}>
          Remove from friends
        </Button>
      </Tooltip>
      :
      <Tooltip title={"Add " + publicUser?.displayName + " as a friend"}>
        <Button variant="contained" onClick={handleAddFriend} startIcon={<PersonAdd/>}>
          Add as friend
        </Button>
      </Tooltip>
      }
      {isBlocked ? (
        <Button color="warning" variant="contained" startIcon={<DoNotDisturbOff/>} onClick={() => handleUnBlockUser(publicUser?.id)}>
          Unblock
        </Button>
      ) : (
        <Button color="error" variant="outlined" startIcon={<DoNotDisturb/>} onClick={() => handleBlockUser(publicUser?.id)}>
          Block
        </Button>
      )
    }
    </>
	)
}

export default PublicProfile