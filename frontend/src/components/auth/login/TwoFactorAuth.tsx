import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import axios from "axios";
import { ChangeEvent, useState } from "react"
import { useNavigate } from "react-router-dom";

const TwoFactorAuth = () => {

    const [code, setCode] = useState("")
    const navigate = useNavigate();

    const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCode(event.target.value);
      };
    
    const handleVerify = async () => {
      try {
        await axios.post(`http://${window.location.hostname}:5000/auth/validate`, { code }, { withCredentials: true });
        await axios.get(`http://${window.location.hostname}:5000/auth/enable`, { withCredentials: true });
        alert("Two-factor authentication has been enabled!");
        window.location.href = `http://${window.location.hostname}:3000`;
      } catch(e) {
        alert("Invalid code. Please try again.");
      }
    };

    
    return (
        <Dialog open={true}>
            <DialogTitle>
                Enter 2FA verification code
            </DialogTitle>
            <DialogContent>
                <TextField label="Verification Code" value={code} onChange={handleCodeChange} inputProps={{ maxLength: 6 }}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleVerify}>Verify</Button>
            </DialogActions>
        </Dialog>
    )
}
export default TwoFactorAuth