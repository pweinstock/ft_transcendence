import React, {useEffect, useState} from "react";
import axios from "axios";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import PingPong from "../game/Game";
import GameView from "../game/GameView";
import Chat from "../chat/Chat";


export default function Auth() {
    const [login, setLogin] = useState(0);
    useEffect(() => {
        axios.get("http://localhost:5000/login/").then((response) => {
            setLogin(response.data.userId);
        });
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PingPong/>}/>
                <Route path="/gameview" element={<GameView/>}/>
                <Route path="/chat" element={<Chat/>}/>
            </Routes>
        </Router>);
}