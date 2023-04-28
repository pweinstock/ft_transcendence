import Button from '@mui/material/Button';
import { LoginOutlined, LoginRounded, LogoutOutlined } from '@mui/icons-material';
import axios from 'axios';

const Logout = () => {
  const handleLogout = () => {
    axios.get(`http://${window.location.hostname}:5000/auth/logout`, { withCredentials: true })
      .then(() => {
        window.location.href = `http://${window.location.hostname}:3000/auth`;
      })
      .catch((error) => console.error(error));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Button variant="contained" color="primary" onClick={handleLogout} startIcon={<LogoutOutlined/>}>
        Logout
      </Button>
    </div>
  );
};

export default Logout