import {Socket} from "socket.io-client";
import axios from "axios";
import {useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {GameData} from "./interfaces/game-data-props";

interface JoinGame {
    displayName : string,
    gameId : string
}

interface JoinGameProps {
    socket: Socket;
    user : User;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);
    const [gameData, setGameData] = useState<GameData>();
    // const [paddleHeight, setPaddleHeight] = useState<number>(75);
    // const [ballSpeed, setBallSpeed] = useState<number>(5);
    // const [paddleSpeed, setPaddleSpeed] = useState<number>(6);


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

    props.socket.on("connected", (data : GameData) => {
        setGameData(data);
    });

    props.socket.on("notconnected", () => {
        //todo : handle error
    });

    return (
        gameData ?
            <div style={{color: "white"}}>
            {gamestoJoin && gamestoJoin.map((item) => (
                <button className='navbutton' onClick={() => joinServer({displayName : props.user.displayName, gameId : item.gameId})}>
                    {"Play Against " + item.firstPlayer}
                </button>
            ))}
            </div>
            :
            <PingPong socket={props.socket} gameData={gameData}/>

    )
}