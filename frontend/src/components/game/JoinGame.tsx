import {Socket} from "socket.io-client";
import axios from "axios";
import {useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";

interface JoinGameProps {
    socket: Socket;
    user : User;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);
    const [gameOption, setGameData] = useState<GameOption>();

    const joinServer = (id : string) => {
        props.socket.emit("join", {displayName : props.user.displayName, gameId : id});
    }

    useEffect(() => {
        axios.get(`http://${window.location.hostname}:5000/game/join`, {withCredentials: true})
            .then(response => {
                if (response && response.status === 200)
                    setGamestoJoin(response.data);
            })
            .catch(e => {
                //todo : handle error
            })
    },[joinServer])

    props.socket.on("joined", (data : GameOption) => {
        setGameData(data);
    });

    props.socket.on("notJoined", () => {
        //todo : handle error
    });

    return (
        gameOption ?
            <PingPong socket={props.socket} gameOption={gameOption}/>
            :
            <div style={{color: "white"}}>
            {gamestoJoin && gamestoJoin.map((game) => (
                <button className='navbutton' onClick={() => {
                    joinServer(game.gameId)
                }}>
                    {"Play Against " + game.firstPlayer}
                </button>
            ))}
            </div>
    )
}