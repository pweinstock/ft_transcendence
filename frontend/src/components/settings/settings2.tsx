import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Switch, Typography, Avatar, IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

function Settings() {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const response = await axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true });
      setNewName(response.data.displayName);
      setAvatar(response.data.photo);
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
        setNewName("");
        setOpen(false);
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
    //const newToggle = !toggle;
    //const url = newToggle ? "http://localhost:5000/auth/enable" : "http://localhost:5000/auth/disable";
    await axios.get(`http://${window.location.hostname}:5000/auth/disable`, { withCredentials: true });
    //setToggle(newToggle);
    console.log('toggle: %s', toggle);
    setToggle(!toggle)
    if (!toggle) {
      // Open the dialog and fetch the image from the server
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
    //if (response.data.valid) {
      await axios.get(`http://${window.location.hostname}:5000/auth/enable`, { withCredentials: true });
      // Close the dialog and show a success message
      //console.log('data: ', response.data);
      setDialogOpen(false);
      alert("Two-factor authentication has been enabled!");
    } catch(e) {
      // Show an error message
      alert("Invalid code. Please try again.");
    }
  };

  const handleDialogClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, reason: string) => {
    if (reason && reason === "backdropClick" && "escapeKeyDown") 
        return;
    setDialogOpen(false);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post("http://localhost:5000/users/upload", formData, {
        withCredentials: true,
      });
      alert("Avatar upluaded successully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setNewName(newName);
  };

  const handleSave = async() => {
    if (newName !== "") {
      try {
        await axios.post(`http://${window.location.hostname}:5000/users/changeName`, { newName }, { withCredentials: true });
      } catch(e) {
          alert("Username already exists!");
      }
    } else {
      alert("Username cannot be empty!");
    }
    setEditing(false);
  };

  const avatarUrl = `http://${window.location.hostname}:5000/users/image/${avatar}`;

  return (
    <div style={{ color: "white" }}>
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
          <Button onClick={handleConfirmName}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={uploadOpen} onClose={handleUploadClose}>
        <DialogTitle>Upload Avatar</DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <div style={{ color: "white", display: "flex", alignItems: "center" }}>
        <Avatar  sx={{ width: 112, height: 112 }} src={avatarUrl}/>
        
        <p style={{ fontSize: "16px", marginRight: "10px" }}>Upload an avatar</p>
        <IconButton color="primary" aria-label="upload picture" component="label">
          <input hidden accept="image/*" type="file" onChange={handleAvatarUpload}/>
          <PhotoCamera />
        </IconButton>
      </div>
      {editing ? (
        <TextField
          label="New Username"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          style={{ marginRight: 1, color: "white" }}
        />
      ) : (
        <Typography variant="body1" style={{ color: "white" }}>
          Username: {newName}
        </Typography>
      )}
      {editing ? (
        <IconButton onClick={handleSave}>
          <SaveIcon style={{ color: "white" }} />
        </IconButton>
      ) : (
        <IconButton onClick={handleEdit}>
          <EditIcon style={{ color: "white" }} />
        </IconButton>
        
      )}
      <Switch checked={toggle} onChange={handleToggleChange} name="Two Factor Authentication"/>Two Factor Authentication
      <Dialog open={dialogOpen} onClose={handleDialogClose /*() => setDialogOpen(false)*/}>
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
    </div>
  );
}

export default Settings;
