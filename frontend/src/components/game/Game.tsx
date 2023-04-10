import React, {useState} from "react";
import {io} from "socket.io-client";
import JoinGame from "./JoinGame";
import {User} from "../BaseInterface";
import CreateGame from "./CreateGame";
import WatchGame from "./WatchGame";

enum GameUIState {
    NOTHING,
    NEW,
    JOIN,
    WATCH
}

interface GameProps {
    user : User,
}

export default function Game(props : GameProps) {
    const socket = io(`http://${window.location.hostname}:5002/game/`, {
        transports: ["websocket"],
    });
    const [gameUIState, setGameUIState] = useState<GameUIState>(GameUIState.NOTHING);

    const newGameClick = () => {
        setGameUIState(GameUIState.NEW);
    };

    const joinGameClick = () => {
        setGameUIState(GameUIState.JOIN);
    };

    const watchGameClick = () => {
        setGameUIState(GameUIState.WATCH);
    };

    return (
        <>
            <button className='navbutton' onClick={newGameClick}>New Game</button>
            <button className='navbutton' onClick={joinGameClick}>Join Game</button>
            <button className='navbutton' onClick={watchGameClick}>Watch Game</button>
            {gameUIState === GameUIState.NEW && <CreateGame user={props.user} socket={socket}/>}
            {gameUIState === GameUIState.JOIN && <JoinGame user={props.user} socket={socket}/>}
            {gameUIState === GameUIState.WATCH && <WatchGame user={props.user} socket={socket}/>}
        </>
    );
}