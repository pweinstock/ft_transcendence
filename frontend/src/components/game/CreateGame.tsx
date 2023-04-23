import React, {useContext, useEffect, useState} from "react";
import {User} from "../BaseInterface";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext} from "../context/game-socket";

interface CreateGameProps {
    user : User;
    cancelGame : any;
    leaveGame : any;
    isCreated : boolean;
}

export default function CreateGame(props : CreateGameProps) {
    const socket = useContext(GameSocketContext);
    const [gameOption, setGameOption] = useState<GameOption>();


    const easyMode = () => {
        socket.emit('create', {
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 100,
            ballSpeed : 3,
            paddleSpeed : 6,
            isStarted : false,
            maxScore : 11
        });
    }

    const normalMode = () => {
        socket.emit('create', {
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 75,
            ballSpeed : 5,
            paddleSpeed : 6,
            isStarted : false,
            maxScore : 11
        });
    }

    const hardMode = () => {
        socket.emit('create', {
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 50,
            ballSpeed : 7,
            paddleSpeed : 5,
            isStarted : false,
            maxScore : 11
        });
    }

    socket.on('started', (gameData : GameOption) => {
        setGameOption(gameData);
    });



    socket.on('notCreated', () => {
        //todo handleError
    });

    return (
        gameOption ?
            <>
                <PingPong gameOption={gameOption}/>
                <button className='navbutton' onClick={props.leaveGame}>Leave</button>
            </>
        :
            props.isCreated ?
                <>
                    <div>WAITING SECOND PLAYER!</div>
                    <button className='navbutton' onClick={props.cancelGame}>Cancel</button>
                </>
            :
                <>
                    <button className='navbutton' onClick={easyMode}>Easy</button>
                    <button className='navbutton' onClick={normalMode}>Normal</button>
                    <button className='navbutton' onClick={hardMode}>Hard</button>
                </>
    )
};