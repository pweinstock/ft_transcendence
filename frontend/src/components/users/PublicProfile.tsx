import { Avatar } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { User } from "../BaseInterface";


interface BaseUserProps {
    currentUser : User;
}

const PublicProfile: React.FC<BaseUserProps> = (props : BaseUserProps) => {
	
    const [publicUser, setPublicUser] = useState<User>();
    const param = useParams();

    useEffect(() => {  
        axios.get(`http://${window.location.hostname}:5000/users/${param.user}`, { withCredentials: true })
          .then((response) => {
            setPublicUser(response.data);
          })
          .catch((error) => {
            alert("User " + param.user + " does not exist!");
          });
        }, []);


	return (
        <Avatar  sx={{ width: 112, height: 112 }} src={`http://${window.location.hostname}:5000/users/image/${publicUser?.photo}`}/>
	)
}

export default PublicProfile