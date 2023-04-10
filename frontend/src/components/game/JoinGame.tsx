import {Socket} from "socket.io-client";
import axios from "axios";
import {useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {GameData} from "./interfaces/game-data-props";
import {GameOption} from "./interfaces/game-option";

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
    const [gameOption, setGameData] = useState<GameOption>();

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

    props.socket.on("connected", (data : GameOption) => {
        setGameData(data);
    });

    props.socket.on("notconnected", () => {
        //todo : handle error
    });

    return (
        gameOption ?
            <PingPong socket={props.socket} gameOption={gameOption}/>
            :
            <div style={{color: "white"}}>
            {gamestoJoin && gamestoJoin.map((item) => (
                <button className='navbutton' onClick={() => {
                    joinServer({displayName : props.user.displayName, gameId : item.gameId})
                }}>
                    {"Play Against " + item.firstPlayer}
                </button>
            ))}
            </div>
    )
}