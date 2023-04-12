import React, {useState} from "react";
import JoinGame from "./JoinGame";
import {User} from "../BaseInterface";
import CreateGame from "./CreateGame";
import WatchGame from "./WatchGame";
import {GameSocketProvider} from "../context/game-socket"
import HighScore from "./HighScore";

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

    const viewHighScore = () => {
        setGameUIState(GameUIState.HIGHSCORE);
    };

    return (
        gameUIState === GameUIState.NOTHING ?
            <>
                <button className='navbutton' onClick={newGameClick}>New Game</button>
                <button className='navbutton' onClick={joinGameClick}>Join Game</button>
                <button className='navbutton' onClick={watchGameClick}>Watch Game</button>
                <button className='navbutton' onClick={viewHighScore}>High Score</button>
            </>
            :
            <GameSocketProvider>
                {gameUIState === GameUIState.NEW && <CreateGame user={props.user}/>}
                {gameUIState === GameUIState.JOIN && <JoinGame user={props.user}/>}
                {gameUIState === GameUIState.WATCH && <WatchGame/>}
                {gameUIState === GameUIState.HIGHSCORE && <HighScore/>}
            </GameSocketProvider>
    );
}