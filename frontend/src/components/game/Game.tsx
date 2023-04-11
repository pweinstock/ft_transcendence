import React, {useContext, useState} from "react";
import JoinGame from "./JoinGame";
import {User} from "../BaseInterface";
import CreateGame from "./CreateGame";
import WatchGame from "./WatchGame";
import {GameSocketContext, GameSocketProvider} from "../context/game-socket"
import {Socket} from "socket.io-client";

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
    const [gameUIState, setGameUIState] = useState(GameUIState.NOTHING);

    const newGameClick = () => setGameUIState(GameUIState.NEW);

    const joinGameClick = () => setGameUIState(GameUIState.JOIN);

    const watchGameClick = () => setGameUIState(GameUIState.WATCH);

    const socket : Socket= useContext(GameSocketContext);
    const leaveGameClick = () => {
        socket.emit("leave");
        setGameUIState(GameUIState.NOTHING);
    };

    return (
        gameUIState === GameUIState.NOTHING ?
            <>
                <button className='navbutton' onClick={newGameClick}>New Game</button>
                <button className='navbutton' onClick={joinGameClick}>Join Game</button>
                <button className='navbutton' onClick={watchGameClick}>Watch Game</button>
            </>
            :
            <GameSocketProvider>
                {gameUIState === GameUIState.NEW && <CreateGame user={props.user}/>}
                {gameUIState === GameUIState.JOIN && <JoinGame user={props.user}/>}
                {gameUIState === GameUIState.WATCH && <WatchGame/>}
                {<button className='navbutton' onClick={leaveGameClick}>Leave Game</button>}
            </GameSocketProvider>
    );
}