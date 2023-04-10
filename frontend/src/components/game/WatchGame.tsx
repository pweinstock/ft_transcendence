import {useEffect, useState} from "react";
import {GameInfo} from "./interfaces/game-info";
import axios from "axios";
import PingPong from "./PingPong";
import {Socket} from "socket.io-client";
import {User} from "../BaseInterface";

interface WatchGameProps {
    socket: Socket;
    user : User;
}


export default function WatchGame(props : WatchGameProps) {
    // const [gamestoWatch, setGamestoWatch] = useState<GameInfo[]>([]);
    // const [isConnected, setConnected] = useState<boolean>(false)
    //
    // const joinServer = (gameId : string) => {
    //     props.socket.emit("view", gameId);
    // }
    //
    // useEffect(() => {
    //     axios.get(`http://${window.location.hostname}:5000/game/watch`, {withCredentials: true})
    //         .then(response => {
    //             if (response && response.status === 200) {
    //                 setGamestoWatch(response.data);
    //             }
    //         })
    //         .catch(e => {
    //             //todo : handle error
    //         })
    // },[joinServer])
    //
    // const gameStart = () => {
    //     setGameStarted(GameStatus.START);//todo add data recieving from socket
    // }
    // const gameView = () => setGameStarted(GameStatus.VIEW);
    //
    //
    // // socket.on("not available", );
    // props.socket.on("reconnect", gameStart);
    // props.socket.on("secondPlayer", gameStart);
    // props.socket.on("viewer", gameView);
    //
    // return (
    //     gameStarted === GameStatus.NOT_CONNECTED ?
    //         <div style={{color: "white"}}>
    //             {gamestoJoin && gamestoJoin.map((item) => (
    //                 <button className='navbutton' onClick={() => joinServer({displayName : props.user.displayName, gameId : item.gameId})}>
    //                     {"Play Against " + item.firstPlayer}
    //                 </button>
    //             ))}
    //         </div>
    //         :
    //         <PingPong socket={props.socket} paddleHeight={paddleHeight} ballSpeed={ballSpeed} paddleSpeed={paddleSpeed}/>
    return <div></div>
}