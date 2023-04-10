import React, {useContext, useState} from "react";
import {User} from "../BaseInterface";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext, GameSocketProvider} from "../context/game-socket";


interface CreateGameProps {
    user : User;
}

enum GameState {
    NOTCREATED,
    START,
    WAITING
}

export default function CreateGame(props : CreateGameProps) {

    const socket = useContext(GameSocketContext);
    const [gameOption, setGameOption] = useState<GameOption>({
        firstPlayer : props.user.displayName,
        secondPlayer : "",
        paddleHeight : 75,
        ballSpeed : 5,
        paddleSpeed : 6,
        isStarted : false
    });
    const [gameStatus, setGameStatus] = useState<GameState>(GameState.NOTCREATED);
    const easyMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 100,
            ballSpeed : 3,
            paddleSpeed : 6,
            isStarted : false
        })
    }

    const normalMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 75,
            ballSpeed : 5,
            paddleSpeed : 6,
            isStarted : false
        })
    }

    const hardMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 50,
            ballSpeed : 7,
            paddleSpeed : 5,
            isStarted : false
        })
    }

    const handleError = () => {} //todo handle error

    const createGame = () => socket.emit('create', gameOption);

    socket.on('started', (gameData : GameOption) => {
        setGameOption(gameData);
        setGameStatus(GameState.START)
    });
    socket.on('created', () => setGameStatus(GameState.WAITING));
    socket.on('notCreated', handleError);


    return (
        <>
            {gameStatus === GameState.NOTCREATED &&
                <div>
                    <button onClick={easyMode}>Easy</button>
                    <button onClick={normalMode}>Normal</button>
                    <button onClick={hardMode}>Hard</button>
                    <button onClick={createGame}>Create Game</button>
                </div>}
            {gameStatus === GameState.WAITING &&
                <div>WAITING SECOND PLAYER!</div>}
            {gameStatus === GameState.START &&
                <GameSocketProvider>
                    <PingPong gameOption={gameOption}/>
                </GameSocketProvider>}
        </>
    )
};