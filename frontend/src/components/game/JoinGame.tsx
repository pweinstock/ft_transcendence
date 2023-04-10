import {Socket} from "socket.io-client";
import axios from "axios";
import {useEffect, useState} from "react";
import {UserTest} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {socket} from "../../socket";

interface JoinGame {
    displayName : string,
    gameId : string
}

interface JoinGameProps {
    socket: Socket;
    user : UserTest;
}

enum GameStatus {
    NOT_CONNECTED,
    START,
    VIEW,
    RECONNECT
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);
    const [gameStarted, setGameStarted] = useState<GameStatus>(GameStatus.NOT_CONNECTED)

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

    },[])

    const gameStart = () => setGameStarted(GameStatus.START);
    // const gameReconnect = () => setGameStarted(GameStatus.RECONNECTED);
    const gameView = () => setGameStarted(GameStatus.VIEW);


    // socket.on("not available", );
    socket.on("reconnect", gameStart);
    socket.on("secondPlayer", gameStart);
    socket.on("viewer", gameView);

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
            <PingPong socket={props.socket}/>
    )
}