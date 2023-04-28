import React from 'react';
import Button from '@mui/material/Button';
import { LoginOutlined, LoginRounded } from '@mui/icons-material';

const Login = () => {
  const handleLogin = () => {
    window.location.href = `http://${window.location.hostname}:5000/auth/login`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Button variant="contained" color="primary" onClick={handleLogin} startIcon={<LoginOutlined/>}>
        Sign In with 42
      </Button>
    </div>
  );
};

export default Login;