import { Check, Close, Edit, FileUpload, Save, Settings } from '@mui/icons-material';
import { Avatar, Badge, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { display, positions } from '@mui/system';
import axios from 'axios';
import React, {ChangeEvent, useContext, useEffect, useState} from 'react';
import { User } from './BaseInterface';
import Game from "./game/Game";
import { GameMeta } from './game/interfaces/game-meta';
import {Socket} from "socket.io-client";
import {UserSocketContext} from "./context/user-socket";
import Logout from './auth/login/Logout';

interface BaseUserProps {
  user : User;
}

const Basic: React.FC<BaseUserProps> = (props : BaseUserProps) => {

    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [photo, setPhoto] = useState<string>("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [first, setFirst] = useState<boolean>();
    const [toggle, setToggle] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [code, setCode] = useState("");
    const [gameHistory, setGameHistory] = useState<GameMeta[]>([]);
    const [userMap, setUserMap] = useState<{[key: string]: User}>({});
    const [userUpdate, setUserUpdate] = useState<boolean>(false);

    const socket : Socket= useContext(UserSocketContext);

    const updateOtherUsers = () =>{
        socket?.emit('userUpdate');
    }

    socket.on('userUpdate', () => {
        userUpdate ? setUserUpdate(false) : setUserUpdate(true);
    });

    useEffect(() => {
      async function fetchUser() {
        //const response = await axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true });
        setNewName(props.user.displayName);
        setPhoto(props.user.photo);
        setFirst(props.user.first);
        if (props.user.first) {
          setOpen(true);
        }
        setToggle(props.user.isTwoFactorAuthenticationEnabled);
        const matchHistory = props.user.matchHistory;
        Promise.all(matchHistory.map((id: string) => {
          return axios.get(`http://${window.location.hostname}:5000/game/id/${id}`, { withCredentials: true })
            .then((response) => response.data)
        })).then((gameMetaList) => {
          setGameHistory(gameMetaList);
        }).catch((error) => {
          console.error(error);
        });
      }
      fetchUser();
    }, [props.user]);

    useEffect(() => {
      if (gameHistory.length === 0)
        return;
      gameHistory.forEach((game) => {
        axios.get(`http://${window.location.hostname}:5000/users/id/${game.firstPlayer}`, { withCredentials: true })
        .then((response) => {
          setUserMap((prevState) => ({...prevState, [game.firstPlayer]: response.data,}));
        })
        .catch((error) => console.log(error));
        axios.get(`http://${window.location.hostname}:5000/users/id/${game.secondPlayer}`, { withCredentials: true })
        .then((response) => {
          setUserMap((prevState) => ({...prevState, [game.secondPlayer]: response.data,}));
        })
        .catch((error) => console.log(error));
      });
    }, [gameHistory]);

    const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, reason: string) => {
        if (reason && reason === "backdropClick" && "escapeKeyDown") 
            return;
        setOpen(false);
    };

    const handleConfirmName = async () => {
        if (newName !== "") {
          try {
            await axios.post(`http://${window.location.hostname}:5000/users/changeName`, { newName }, { withCredentials: true });
            //setNewName("");
            updateOtherUsers();
            setOpen(false);
            if (first)
              setUploadOpen(true);
          } catch(e) {
              alert(e);
          }
        } else {
          alert("Username cannot be empty!");
        }
    };

    const handleNewNameChange = (event: ChangeEvent<HTMLInputElement>) => {
      const regex = /^[A-Za-z0-9]*$/;
      if (regex.test(event.target.value))
        setNewName(event.target.value);
      else
        alert("Username can only contains letters and digits!")
    };
    
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setImage(event.target.files[0]);
      }
    };
    
    const handleUploadClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, reason: string) => {
      if (reason && reason === "backdropClick" && "escapeKeyDown") 
          return;
      setUploadOpen(false);
    };
    
    const handleUploadConfirm = async () => {
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(`http://${window.location.hostname}:5000/users/upload`, formData, { withCredentials: true })
        .catch((error) => { alert(error + ': Invalid File!')});
        setUploadOpen(false);
        updateOtherUsers();
      }
      else
          setUploadOpen(false);
    };

    const handleToggleChange = async () => {
      await axios.get(`http://${window.location.hostname}:5000/auth/disable`, { withCredentials: true });
      setToggle(!toggle)
      if (!toggle) {
        setDialogOpen(true);
        const response = await fetch(`http://${window.location.hostname}:5000/auth/generate`, { credentials: "include" });
            const imageBlob = await response.blob();
            setImageSrc(URL.createObjectURL(imageBlob));
      } else {
        setDialogOpen(false);
        alert("Two-factor authentication has been disabled!")
      }
    };

    const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
      setCode(event.target.value);
    };

    const handleVerify = async () => {
      try {
        await axios.post(`http://${window.location.hostname}:5000/auth/validate`, { code }, { withCredentials: true });
        await axios.get(`http://${window.location.hostname}:5000/auth/enable`, { withCredentials: true });
        setDialogOpen(false);
        alert("Two-factor authentication has been enabled!");
      } catch(e) {
        alert("Invalid code. Please try again.");
      }
    };

    const handleDialogCancel = async () => {
      const response = await axios.get(`http://${window.location.hostname}:5000/auth/disable`, { withCredentials: true });
      if (!response.data.isTwoFactorAuthenticated) {
        setToggle(!toggle);
        setDialogOpen(false);
        //alert("Two-factor authentication has been disabled!");
      } else {
        alert("Two-factor authentication could not been disabled!");
      }
    }

    const handleDialogClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, reason: string) => {
      if (reason && reason === "backdropClick" && "escapeKeyDown") 
          return;
      setDialogOpen(false);
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Username</DialogTitle>
                <DialogContent>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Username"
                    value={newName}
                    onChange={handleNewNameChange}
                    fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<Save/>} onClick={handleConfirmName}>Confirm</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={uploadOpen} onClose={handleUploadClose}>
                <DialogTitle>Upload Avatar</DialogTitle>
                <DialogContent>
                    <input type="file" onChange={handleFileChange} />
                 </DialogContent>
                <DialogActions>
                    <Button startIcon={<Save/>} onClick={handleUploadConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogContent>
                <img src={imageSrc} alt="QR code" />
                <Typography variant="body1">Scan this QR code with your authenticator app to get a verification code.</Typography>
                <TextField label="Verification Code" value={code} onChange={handleCodeChange} inputProps={{ maxLength: 6 }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogCancel/*() => setDialogOpen(false)*/}>Cancel</Button>
                <Button onClick={handleVerify}>Verify</Button>
              </DialogActions>
            </Dialog>
            <section>
                <h1> Welcome {newName}! </h1>
                <Logout/>
                <Badge
                  badgeContent={
                    <Tooltip title="Settings">
                      <IconButton sx={{ fontSize: 32, color: 'white' }} onClick={() => setSettingsOpen(!settingsOpen)}>
                        <Settings/>
                      </IconButton>
                    </Tooltip>
                }
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  sx={{ width: 64, height: 64 }}
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                  {String(photo).length && (
                  <Avatar src={`http://${window.location.hostname}:5000/users/image/${photo}`} sx={{ width: 64, height: 64}}>
                  </Avatar> )}
                </Badge>
                {settingsOpen ? (
                <List
                  sx={{ width: '25%', height: 'auto', bgcolor: 'background.paper' }}
                  subheader={<ListSubheader>Settings</ListSubheader>}
                >
                  <ListItem>
                    <ListItemText primary="change Username"/>
                    <IconButton onClick={() => setOpen(true)}>
                      <Edit/>
                    </IconButton>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="change Avatar"/>
                    <IconButton onClick={() => setUploadOpen(true)}>
                      <FileUpload/>
                    </IconButton>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2FA"/>
                    <Switch checked={toggle} onChange={handleToggleChange} name="Two Factor Authentication"/>
                  </ListItem>
                </List>
                ) : <></>}
            </section>
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
                <TableBody> {userMap && gameHistory && gameHistory.map((game : GameMeta) => (
                    <TableRow key={game.id} style={{backgroundColor: !game.winner || !userMap[game.winner] ? 'lightyellow' : userMap[game.winner].displayName === newName ? 'lightgreen' : 'lightcoral'}}>
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
                        {userMap[game.firstPlayer] && userMap[game.firstPlayer].displayName}
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
                        {userMap[game.secondPlayer] && userMap[game.secondPlayer].displayName}
                      </TableCell>
                      <TableCell align="right">{game.firstPlayerScore + " : " + game.secondPlayerScore}</TableCell>
                      <TableCell align="right">{game.finished ? <Check/> : <Close/>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </>
    ); 
}
export default Basic