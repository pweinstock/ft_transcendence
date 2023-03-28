
import React from 'react'
import Auth from "./auth/Auth";
import {BrowserRouter as Router, Link} from "react-router-dom";
import Button from "@mui/material/Button/Button";
import PingPong from "./game/Game";
import GameView from "./game/GameView";
import Chat from "./chat/Chat";

export default function App() {
    const isAuthorised = Validator();

    if (isAuthorised == false)
        return (
            <div className="App">
                <Auth/>
            </div>
        )
    return (
        <div className="App">
            <Router>
                <header>
                    <Link to={"Chat"} > <Button variant="outlined">Authentification</Button></Link>
                </header>
                <Routes>
                    <Route path="/" element={<PingPong/>}/>
                    <Route path="/GameView" element={<GameView/>}/>
                    <Route path="/Chat" element={<Chat/>}/>
                </Routes>
            </Router>
        </div>
    )
}