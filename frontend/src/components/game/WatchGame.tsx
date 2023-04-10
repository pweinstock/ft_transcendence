import {useEffect, useState} from "react";
import {GameInfo} from "./interfaces/game-info";
import axios from "axios";
import PingPongView from "./PingPongView";
import {Socket} from "socket.io-client";
import {User} from "../BaseInterface";
import {GameData} from "./interfaces/game-data-props";

interface WatchGameProps {
    socket: Socket;
    user : User;
}


export default function WatchGame(props : WatchGameProps) {
    const [gamestoWatch, setGamestoWatch] = useState<GameInfo[]>([]);
    const [gameData, setGameData] = useState<GameData>()


    const joinServer = (gameId : string) => {
        props.socket.emit("watch", gameId);
    }

    useEffect(() => {
        axios.get(`http://${window.location.hostname}:5000/game/watch`, {withCredentials: true})
            .then(response => {
                if (response && response.status === 200) {
                    setGamestoWatch(response.data);
                }
            })
            .catch(e => {
                //todo : handle error
            })
    },[joinServer])

    const handleError = () => {
        //todo : handle error
    }

    props.socket.on("viewerJoined", (data : GameData) => {
        setGameData(data);
    });
    props.socket.on("viewerNotJoined", handleError);

    return (
        gameData ?
            <PingPongView socket={props.socket} gameData={gameData} />
            :
            <div style={{color: "white"}}>
                {gamestoWatch && gamestoWatch.map((item) => (
                    <button className='navbutton' onClick={() => joinServer(item.gameId)}>
                        {"Play Against " + item.firstPlayer}
                    </button>
                ))}
            </div>
    )
}