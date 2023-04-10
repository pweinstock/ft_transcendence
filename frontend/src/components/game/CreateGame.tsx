import React, { useState } from "react";
import {User} from "../BaseInterface";
import {Socket} from "socket.io-client";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";


interface CreateGameProps {
    socket : Socket;
    user : User;
}

export default function CreateGame(props : CreateGameProps) {
    const [gameOption, setGameOption] = useState<GameOption>({
        firstPlayer : props.user.displayName,
        secondPlayer : "",
        paddleHeight : 75,
        ballSpeed : 5,
        paddleSpeed : 6,
        isStarted : false
    });
    const [gameStarted, setGameStarted] = useState<boolean>(false);


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

    const createGame = () => {
        props.socket.emit('create', )
    };

    props.socket.on('started', (options) => {
        setGameOption(options);
        setGameStarted(true);
    });
    props.socket.on('failed', handleError);


    return (
        gameStarted ?
            <div>
                <button onClick={easyMode}>Easy</button>
                <button onClick={normalMode}>Normal</button>
                <button onClick={hardMode}>Hard</button>
                <button onClick={createGame}>Create Game</button>
            </div>
            :
            <PingPong socket={props.socket} gameOption={gameOption}/>
    )
};