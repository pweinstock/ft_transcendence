import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const TwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState('');

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = event.target.value;
    if (newCode.length <= 6) {
      setCode(newCode);
    }
  };

  const handleValidation = () => {
    fetch('http://localhost:5000/auth/validate', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setValidationResult('Validation successful');
        } else {
          setValidationResult('Validation failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleContinue = () => {
    window.location.href = 'http://localhost:3000/users';
  };

  return (
    <>
      <TextField
        label="Enter 2FA validation code"
        value={code}
        onChange={handleCodeChange}
        inputProps={{
          maxLength: 6,
          style: {
            color: 'white'
          }
        }}
        InputLabelProps={{
          style: {
            color: 'white'
          }
        }}
      />
      <Button variant="contained" onClick={handleValidation}>Validate</Button>
      {validationResult && (
        <>
          <Typography variant="body1" style={{ color: 'white' }}>
            {validationResult}
          </Typography>
          {validationResult === 'Validation successful' && (
            <Button variant="contained" onClick={handleContinue}>Continue</Button>
          )}
        </>
      )}
    </>
  );
};

export default TwoFactorAuth;