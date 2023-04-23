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
    HIGHSCORE,
    RECONNECT
}

interface GameProps {
    user : User,
}

export default function Game(props : GameProps) {
    const socket : Socket = useContext(GameSocketContext);
    const [UIState, setGameUIState] = useState(GameUIState.NOTHING);
    const [isCreated, setCreated] = useState<boolean>(false);

    useEffect(() => {
        socket.emit('checkCreated');
    }, [])


    useEffect(() => {
        socket.emit('checkInGame');
    }, [])

    socket.on("inGame", () => setGameUIState(GameUIState.RECONNECT))
    socket.on('created', () => {
        setGameUIState(GameUIState.NEW);
        setCreated(true);
    })

    const newGameClick = () => setGameUIState(GameUIState.NEW);
    const joinGameClick = () => setGameUIState(GameUIState.JOIN);
    const watchGameClick = () => setGameUIState(GameUIState.WATCH);
    const viewHighScore = () => setGameUIState(GameUIState.HIGHSCORE);


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
            <button className='navbutton' onClick={viewHighScore}>High Score</button>
        </>
        :
        <>
            {UIState === GameUIState.NEW &&
                <CreateGame user={props.user} cancelGame={cancelGame} leaveGame={leaveGame} isCreated={isCreated}/>}
            {UIState === GameUIState.JOIN &&
                <JoinGame user={props.user} leaveGame={leaveGame}/>}
            {UIState === GameUIState.WATCH &&
                <WatchGame/>}
            {UIState === GameUIState.HIGHSCORE &&
                <HighScore/>}
            {UIState === GameUIState.RECONNECT &&
                <ReconnectGame user={props.user} leaveGame={leaveGame}/>}
        </>
    );
}