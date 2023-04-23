import React, {useContext, useState} from "react";
import {User} from "../BaseInterface";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext} from "../context/game-socket";


interface CreateGameProps {
    user : User;
    backToOptions : any;
    isCreated : boolean;
    isStarted : boolean;
    setStarted : React.Dispatch<React.SetStateAction<any>>;
    setCreated : React.Dispatch<React.SetStateAction<any>>;
}

export default function CreateGame(props : CreateGameProps) {

    const socket = useContext(GameSocketContext);
    const [gameOption, setGameOption] = useState<GameOption>();

    const easyMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 100,
            ballSpeed : 3,
            paddleSpeed : 6,
            isStarted : false,
            maxScore : 11
        })
        socket.emit('create', gameOption);
    }

    const normalMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 75,
            ballSpeed : 5,
            paddleSpeed : 6,
            isStarted : false,
            maxScore : 11
        })
        socket.emit('create', gameOption);
    }

    const hardMode = () => {
        setGameOption({
            firstPlayer : props.user.displayName,
            secondPlayer : "",
            paddleHeight : 50,
            ballSpeed : 7,
            paddleSpeed : 5,
            isStarted : false,
            maxScore : 11
        })
        socket.emit('create', gameOption);
    }

    const handleError = () => {} //todo handle error

    socket.on('started', (gameData : GameOption) => {
        props.setCreated(false);
        props.setStarted(true);
        setGameOption(gameData);
    });
    socket.on('created', () => {
        props.setCreated(true);
    });

    socket.on('notCreated', () => handleError);

    return (
        props.isStarted && gameOption ?
            <PingPong gameOption={gameOption}/>
        :
            props.isCreated ?
                <>
                    <div>WAITING SECOND PLAYER!</div>
                    <button className='navbutton' onClick={props.backToOptions}>Cancel</button>
                </>
            :
                <>
                    <button className='navbutton' onClick={easyMode}>Easy</button>
                    <button className='navbutton' onClick={normalMode}>Normal</button>
                    <button className='navbutton' onClick={hardMode}>Hard</button>
                </>
    )
};