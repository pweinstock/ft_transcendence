import React from 'react';
import Button from '@mui/material/Button';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/login';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#000' }}>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Sign In with 42
      </Button>
    </div>
  );
};

export default Login;