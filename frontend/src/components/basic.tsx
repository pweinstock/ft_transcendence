import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import Game from "./game/Game";

export default function Basic() {

    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    
    useEffect(() => {
        async function fetchUser() {
          const response = await axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true });
          setNewName(response.data.displayName);
          if (response.data.first) {
            setOpen(true);
          }
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
    
    return (
        <>
            <section>
                <h1> Welcome {newName}! </h1>
                {/*<Game/>*/}
            </section>
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
        </>
    );
}
