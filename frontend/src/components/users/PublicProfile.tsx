import { Check, Close, DoNotDisturb, DoNotDisturbOff, DoNotDisturbOffOutlined, PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar, Badge, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import { waitFor } from '@testing-library/react';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { User } from "../BaseInterface";
import { GameMeta } from '../game/interfaces/game-meta';

interface BaseUserProps {
    currentUser : User;
}

const PublicProfile: React.FC<BaseUserProps> = (props : BaseUserProps) => {
	
    const [publicUser, setPublicUser] = useState<User>();
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [gameHistory, setGameHistory] = useState<GameMeta[]>([]);
    const [userMap, setUserMap] = useState<{[key: string]: User}>({});
    const param = useParams();

    useEffect(() => {  
        axios.get(`http://${window.location.hostname}:5000/users/name/${param.user}`, { withCredentials: true })
          .then((response) => {
            setPublicUser(response.data);
            if (response.data.displayName === props.currentUser.displayName)
              window.location.href = `http://${window.location.hostname}:3000`;
            setIsFriend(props.currentUser.friends.includes(response.data.id));
            setIsBlocked(props.currentUser.bannedUsers.includes(response.data.id));
            const matchHistory = response.data.matchHistory;
            Promise.all(matchHistory.map((id: string) => {
              return axios.get(`http://${window.location.hostname}:5000/game/id/${id}`, { withCredentials: true })
                .then((response) => response.data)
            })).then((gameMetaList) => {
              setGameHistory(gameMetaList);
            }).catch((error) => {
              console.error(error);
            });
            // gameHistory.forEach(game => {
            //   axios.get(`http://${window.location.hostname}:5000/users/name/${game.firstPlayer}`)
            //   .then(response => setUserMap(prevState => ({ ...prevState, [game.firstPlayer]: response.data })))
            //   .catch(error => console.log(error));
            // })
          })
          .catch((error) => {
            alert(error + ": User " + param.user + " does not exist!");
          });
        }, []);

    useEffect(() => {
      console.log("gameHistory: %s", gameHistory.length);
      if (gameHistory.length === 0)
        return;
      gameHistory.forEach((game) => {
        axios.get(`http://${window.location.hostname}:5000/users/name/${game.firstPlayer}`, { withCredentials: true })
        .then((response) => {
          setUserMap((prevState) => ({...prevState, [game.firstPlayer]: response.data,}));
        })
        .catch((error) => console.log(error));
        axios.get(`http://${window.location.hostname}:5000/users/name/${game.secondPlayer}`, { withCredentials: true })
        .then((response) => {
          setUserMap((prevState) => ({...prevState, [game.secondPlayer]: response.data,}));
        })
        .catch((error) => console.log(error));
      });
    }, [gameHistory]);

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

    const dateToString = ( date : Date) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString("de-DE") + ' - ' + dateObj.toLocaleTimeString("de-DE");
    }

    const handleAvatarClick = (displayName: string) => {
      window.location.href = `http://${window.location.hostname}:3000/users/${displayName}`;
    }

	return (
    <>
      <Avatar  sx={{ width: 112, height: 112 }} src={`http://${window.location.hostname}:5000/users/image/${publicUser?.photo}`}/>
      <h1 style={{ color: 'white' }}>{publicUser?.displayName}</h1>
      {isFriend ? 
      <Button variant="outlined" onClick={handleRemoveFriend} startIcon={<PersonRemove/>}>
        Remove from friends
      </Button>
      :
      <Button variant="contained" onClick={handleAddFriend} startIcon={<PersonAdd/>}>
        Add as friend
      </Button>
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
      <TableContainer component={Paper}>
        <Table aria-label="simple table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="left">Player 1</TableCell>
              <TableCell align="left">Player 2</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Finished</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameHistory.map((game : GameMeta) => (
              <TableRow key={game.id} style={{backgroundColor: game.winner === null ? 'lightyellow' : game.winner === publicUser?.displayName ? 'lightgreen' : 'lightcoral'}}>
                <TableCell>{dateToString(game.date)}</TableCell>
                <TableCell>
                  {userMap[game.firstPlayer] &&
                  <Tooltip title={userMap[game.firstPlayer].status}>
                    <Badge
                      color={userMap[game.firstPlayer].status === 'online' ? "success" : userMap[game.firstPlayer].status === 'offline' ? "error" : "warning"}
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot">
                      <Avatar src={`http://${window.location.hostname}:5000/users/image/${userMap[game.firstPlayer].photo}`} onClick={() => handleAvatarClick(userMap[game.firstPlayer].displayName)}>
                      </Avatar>
                    </Badge>
                  </Tooltip>}
                  {game.firstPlayer}
                </TableCell>
                <TableCell>
                  {userMap[game.secondPlayer] &&
                  <Tooltip title={userMap[game.secondPlayer].status}>
                    <Badge
                      color={userMap[game.secondPlayer].status === 'online' ? "success" : userMap[game.secondPlayer].status === 'offline' ? "error" : "warning"}
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot">
                      <Avatar src={`http://${window.location.hostname}:5000/users/image/${userMap[game.secondPlayer].photo}`} onClick={() => handleAvatarClick(userMap[game.secondPlayer].displayName)}>
                      </Avatar>
                    </Badge>  
                  </Tooltip>}
                  {game.secondPlayer}
                </TableCell>
                <TableCell align="right">{game.firstPlayerScore + " : " + game.secondPlayerScore}</TableCell>
                <TableCell align="right">{game.finished ? <Check/> : <Close/>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
	)
}

export default PublicProfile