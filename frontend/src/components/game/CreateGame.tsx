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
            paddleHeight : 75,
            ballSpeed : 5,
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
            paddleHeight : 75,
            ballSpeed : 5,
            paddleSpeed : 6,
            isStarted : false
        })
    }

    const handleError = () => {} //todo handle error

    const createGame = () => socket.emit('create', gameOption);

    socket.on('started', () => setGameStatus(GameState.START));
    socket.on('notCreated', () => setGameStatus(GameState.WAITING));
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
                <p>WAITING SECOND PLAYER!</p>            }
            {gameStatus === GameState.START &&
                <GameSocketProvider>
                    <PingPong gameOption={gameOption}/>
                </GameSocketProvider>}
        </>
    )
};