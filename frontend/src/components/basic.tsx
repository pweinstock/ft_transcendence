import { Edit, FileUpload, Save, Settings } from '@mui/icons-material';
import { Avatar, Badge, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { display, positions } from '@mui/system';
import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import Game from "./game/Game";

export default function Basic() {

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
    
    useEffect(() => {
      async function fetchUser() {
        const response = await axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true });
        setNewName(response.data.displayName);
        setPhoto(response.data.photo);
        setFirst(response.data.first);
        if (response.data.first) {
          setOpen(true);
        }
        setToggle(response.data.isTwoFactorAuthenticationEnabled);
      }
      fetchUser();
    }, []);

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
            setOpen(false);
            if (first)
              setUploadOpen(true);
          } catch(e) {
              alert("Username already exists!");
          }
        } else {
          alert("Username cannot be empty!");
        }
    };

    const handleNewNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewName(event.target.value);
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
        await axios.post(`http://${window.location.hostname}:5000/users/upload`, formData, { withCredentials: true });
        setUploadOpen(false);
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
                  <Avatar src={`http://${window.location.hostname}:5000/users/image/${photo}`} sx={{ width: 64, height: 64}}>
                  </Avatar> 
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
        </>
    );
}
