import React, { useState, useEffect } from "react";
import {
  Typography,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Avatar,
  Switch,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
// import SaveIcon from "@mui/icons-material/Save";
// import PhotoCamera from "@mui/icons-material/PhotoCamera";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/users/current", { credentials: 'include' })
      .then((response) => {
        if (response.status === 401) {
          window.location.href = "http://localhost:3000/auth";
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setUsername(data.displayName);
        setEmail(data.email);
        setAvatarUrl(data.avatarUrl);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setNewUsername(username);
  };

  const handleSave = () => {
    setEditing(false);
    setUsername(newUsername);
    fetch("http://localhost:5000/users/changeName", { 
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        newName: newUsername
      }) 
    })
      .then((response) => {
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    fetch("http://localhost:5000/users/upload", { 
      method: "POST",
      credentials: "include",
      body: formData 
    })
      .then((response) => response.json())
      .then((data) => {
        setAvatarUrl(data.avatarUrl);
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      try {
        // Send a request to enable authentication
        const enableResponse = await fetch('http://localhost:5000/auth/enable', { credentials: "include" });
        if (enableResponse.ok) {
          // If enabling authentication was successful, prompt for code
          const imageResponse = await fetch('http://localhost:5000/auth/generate', { credentials: "include" });
          const imageBlob = await imageResponse.blob();
          setImageSrc(URL.createObjectURL(imageBlob));
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        // Send a request to disable authentication
        const disableResponse = await fetch('http://localhost:5000/auth/disable', { credentials: "include" });
        if (disableResponse.ok) {
          // If disabling authentication was successful, clear the code and image
          setCode('');
          setImageSrc('');
          setValidationSuccess(false);
          setValidationFailed(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handleValidate = async () => {
    try {
      // Send a request to validate the code
      const validateResponse = await fetch('http://localhost:5000/auth/validate', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      if (validateResponse.ok) {
        // If validation was successful, reload the page
        setValidationSuccess(true);
        setValidationFailed(false);
        setCode('');
        setImageSrc('');
      } else {
        // If validation failed, show error message
        setValidationSuccess(false);
        setValidationFailed(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 2, backgroundColor: "black" }}>
  <Typography variant="h5" style={{ color: "white" }}>
    Settings
  </Typography>
  <div style={{ marginTop: 2 }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <Avatar src={avatarUrl} style={{ marginRight: 1 }} />
      <input
        type="file"
        accept="image/*"
        id="avatar-upload-input"
        style={{ display: "none" }}
        onChange={handleAvatarUpload}
      />
      <label htmlFor="avatar-upload-input">
        <IconButton component="span">
          {/* <PhotoCamera style={{ color: "white" }} /> */}
        </IconButton>
      </label>
      {editing ? (
        <TextField
          label="New Username"
          value={newUsername}
          onChange={(event) => setNewUsername(event.target.value)}
          style={{ marginRight: 1, color: "white" }}
        />
      ) : (
        <Typography variant="body1" style={{ color: "white" }}>
          Username: {username}
        </Typography>
      )}
      {editing ? (
        <IconButton onClick={handleSave}>
          {/* <SaveIcon style={{ color: "white" }} /> */}
        </IconButton>
      ) : (
        <IconButton onClick={handleEdit}>
          <EditIcon style={{ color: "white" }} />
        </IconButton>
      )}
    </div>
    <Typography variant="body1" style={{ color: "white" }}>
      Email: {email}
    </Typography>
  </div>
  <>
      <Switch
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'controlled' }}
      />
      {checked && (
        <>
          {!validationSuccess && (
            <>
              <img src={imageSrc} alt="authentication code" />
              <TextField
                label="Enter code"
                value={code}
                onChange={handleCodeChange}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              <Button variant="contained" onClick={handleValidate}>
                Validate
              </Button>
            </>
          )}
          {validationSuccess && (
            <p style={{ color: 'white' }}>Validation successful</p>
          )}
          {validationFailed && (
            <p style={{ color: 'white' }}>Wrong validation code</p>
          )}
        </>
      )}
    </>
  <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose}>
    <Alert onClose={handleSnackbarClose} severity="success" style={{ width: '100%' }}>
      Username updated successfully!
    </Alert>
  </Snackbar>
</div>
  );
}

export default Settings;