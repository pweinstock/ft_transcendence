import React, {useState} from "react";
import JoinGame from "./JoinGame";
import {User} from "../BaseInterface";
import CreateGame from "./CreateGame";
import WatchGame from "./WatchGame";
import {GameSocketProvider} from "../context/game-socket"

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
            </GameSocketProvider>
    );
}