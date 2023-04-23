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
    HIGHSCORE
}

interface GameProps {
    user : User,
}

export default function Game(props : GameProps) {
    const socket : Socket = useContext(GameSocketContext);
    const [UIState, setGameUIState] = useState(GameUIState.NOTHING);
    const [gameStarted, setStarted] = useState(false);
    const [gameCreated, setCreated] = useState(false);
    const [inGame, setInGame] = useState(false);


    useEffect(() => {
        socket.emit('checkInGame');
        if (gameCreated)
            setGameUIState(GameUIState.NEW);
    }, [])

    socket.on("inGame", (isPlayer : boolean) => setInGame(isPlayer))

    const newGameClick = () => setGameUIState(GameUIState.NEW);
    const joinGameClick = () => setGameUIState(GameUIState.JOIN);
    const watchGameClick = () => setGameUIState(GameUIState.WATCH);
    const viewHighScore = () => setGameUIState(GameUIState.HIGHSCORE);


    const leaveGameClick = () => {
        socket.emit("leave");
        setStarted(false);
        setGameUIState(GameUIState.NOTHING);
    };

    const backToOptions = () => {
        if (gameCreated) {
            socket.emit("cancel");
            setCreated(false);
        }
        setGameUIState(GameUIState.NOTHING);
    };

    return (
        inGame ?
            <ReconnectGame user={props.user} setStarted={setStarted} setInGame={setInGame}/>
        :
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
                <CreateGame user={props.user} setStarted={setStarted} isStarted={gameStarted}
                            isCreated={gameCreated} setCreated={setCreated} backToOptions={backToOptions}/>}
            {UIState === GameUIState.JOIN &&
                <JoinGame user={props.user} setIsStarted={setStarted}/>}
            {UIState === GameUIState.WATCH &&
                <WatchGame/>}
            {UIState === GameUIState.HIGHSCORE &&
                <HighScore/>}
            {gameStarted ?
                <button className='navbutton' onClick={leaveGameClick}>Leave</button>
                :
                <button className='navbutton' onClick={backToOptions}>Back</button>
            }
        </>
    );
}