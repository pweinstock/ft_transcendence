import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Switch, Typography } from "@mui/material";

function Settings() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [newName, setNewName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const response = await axios.get("http://localhost:5000/users/current", { withCredentials: true });
      if (response.data.first) {
        setDisplayName(response.data.displayName);
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
      await axios.post("http://localhost:5000/users/changeName", { newName }, { withCredentials: true });
      setDisplayName(newName);
      setNewName("");
      setOpen(false);
      setUploadOpen(true);
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
      await axios.post("http://localhost:5000/users/upload", formData, { withCredentials: true });
      setUploadOpen(false);
    }
    else
        setUploadOpen(false);
  };

  const handleToggleChange = async () => {
    //const newToggle = !toggle;
    //const url = newToggle ? "http://localhost:5000/auth/enable" : "http://localhost:5000/auth/disable";
    await axios.get("http://localhost:5000/auth/disable", { withCredentials: true });
    //setToggle(newToggle);
    console.log('toggle: %s', toggle);
    setToggle(!toggle)
    if (!toggle) {
      // Open the dialog and fetch the image from the server
      setDialogOpen(true);
      const response = await fetch('http://localhost:5000/auth/generate', { credentials: "include" });
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
    const response = await axios.post("http://localhost:5000/auth/validate", { code }, { withCredentials: true });
    if (response.data.valid) {
      const response = await axios.get("http://localhost:5000/auth/enable", { withCredentials: true });
      // Close the dialog and show a success message
      setDialogOpen(false);
      alert("Two-factor authentication has been enabled!");
    } else {
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
    const response = await axios.get("http://localhost:5000/auth/disable", { withCredentials: true });
    if (!response.data.isTwoFactorAuthenticated) {
      setToggle(!toggle);
      setDialogOpen(false);
      //alert("Two-factor authentication has been disabled!");
    } else {
      alert("Two-factor authentication could not been disabled!");
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Username</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            value={newName || displayName}
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
      <Switch checked={toggle} onChange={handleToggleChange} name="Two Factor Authentication"/>
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
