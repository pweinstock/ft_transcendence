import React, {useContext, useEffect, useState} from "react";
import JoinGame from "./JoinGame";
import {User} from "../BaseInterface";
import CreateGame from "./CreateGame";
import WatchGame from "./WatchGame";
import HighScore from "./HighScore";
import {GameSocketContext} from "../context/game-socket"
import {Socket} from "socket.io-client";
import ReconnectGame from "./ReconnectGame";

enum GameUIState {
    NOTHING,
    NEW,
    JOIN,
    WATCH,
    RECONNECT
}

interface GameProps {
    user : User,
}

export default function Game(props : GameProps) {
    const socket : Socket = useContext(GameSocketContext);
    const [UIState, setGameUIState] = useState(GameUIState.NOTHING);

    useEffect(() => {
        socket.emit('checkCreated');
    }, [UIState])


    useEffect(() => {
        socket.emit('checkInGame');
    }, [UIState])

    socket.on("inGame", () => setGameUIState(GameUIState.RECONNECT));

    const newGameClick = () => setGameUIState(GameUIState.NEW);
    const joinGameClick = () => setGameUIState(GameUIState.JOIN);
    const watchGameClick = () => setGameUIState(GameUIState.WATCH);


    const leaveGame = () => {
        socket.emit("leave", props.user.displayName);
        setGameUIState(GameUIState.NOTHING);
    };

    const cancelGame = () => {
        socket.emit("cancel");
        setGameUIState(GameUIState.NOTHING);
    };

    return (
        UIState === GameUIState.NOTHING ?
        <>
            <button className='navbutton' onClick={newGameClick}>New Game</button>
            <button className='navbutton' onClick={joinGameClick}>Join Game</button>
            <button className='navbutton' onClick={watchGameClick}>Watch Game</button>
        </>
        :
        <>
            {UIState === GameUIState.NEW &&
                <CreateGame user={props.user} cancelGame={cancelGame} leaveGame={leaveGame}/>}
            {UIState === GameUIState.JOIN &&
                <JoinGame user={props.user} leaveGame={leaveGame}/>}
            {UIState === GameUIState.WATCH &&
                <WatchGame/>}
            {UIState === GameUIState.RECONNECT &&
                <ReconnectGame user={props.user} leaveGame={leaveGame}/>}
        </>
    );
}