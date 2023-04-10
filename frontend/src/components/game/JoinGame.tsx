import {Socket} from "socket.io-client";
import axios from "axios";
import {useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";

interface JoinGame {
    displayName : string,
    gameId : string
}

enum GameStatus {
    NOT_CONNECTED,
    START,
    VIEW
}

interface JoinGameProps {
    socket: Socket;
    user : User;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);
    const [gameStarted, setGameStarted] = useState<GameStatus>(GameStatus.NOT_CONNECTED);
    const [paddleHeight, setPaddleHeight] = useState<number>(75);
    const [ballSpeed, setBallSpeed] = useState<number>(5);
    const [paddleSpeed, setPaddleSpeed] = useState<number>(6);


    const joinServer = (data : JoinGame) => {
        props.socket.emit("join", data);
    }
    useEffect(() => {
        axios.get(`http://${window.location.hostname}:5000/game/join`, {withCredentials: true})
            .then(response => {
                if (response && response.status === 200) {
                    setGamestoJoin(response.data);
                    console.log(response);
                }
            })
            .catch(e => {
                //todo : handle error
            })
    },[joinServer])

    const gameStart = () => {
        setGameStarted(GameStatus.START);//todo add data recieving from socket
    }
    const gameView = () => setGameStarted(GameStatus.VIEW);


    // socket.on("not available", );
    props.socket.on("reconnect", gameStart);
    props.socket.on("secondPlayer", gameStart);
    props.socket.on("viewer", gameView);

    return (
        gameStarted === GameStatus.NOT_CONNECTED ?
            <div style={{color: "white"}}>
            {gamestoJoin && gamestoJoin.map((item) => (
                <button className='navbutton' onClick={() => joinServer({displayName : props.user.displayName, gameId : item.gameId})}>
                    {"Play Against " + item.firstPlayer}
                </button>
            ))}
            </div>
            :
            <PingPong socket={props.socket} paddleHeight={paddleHeight} ballSpeed={ballSpeed} paddleSpeed={paddleSpeed}/>
    )
}