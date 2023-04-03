import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

function Settings() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [newName, setNewName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const response = await axios.get("http://localhost:5000/users/current", { withCredentials: true });
      if (/*response.data.first*/true) {
        setDisplayName(response.data.displayName);
        setOpen(true);
      }
    }
    fetchUser();
  }, []);

  const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, reason: string) => {
    if (reason && reason == "backdropClick" && "escapeKeyDown") 
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
    if (reason && reason == "backdropClick" && "escapeKeyDown") 
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
    </div>
  );
}

export default Settings;
