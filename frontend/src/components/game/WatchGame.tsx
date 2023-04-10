import {useContext, useEffect, useState} from "react";
import {GameInfo} from "./interfaces/game-info";
import axios from "axios";
import PingPongView from "./PingPongView";
import {io} from "socket.io-client";
import {User} from "../BaseInterface";
import {GameData} from "./interfaces/game-data-props";
import {GameSocketContext, GameSocketProvider} from "../context/game-socket";

interface WatchGameProps {
    user : User;
}


export default function WatchGame(props : WatchGameProps) {
    const [gamestoWatch, setGamestoWatch] = useState<GameInfo[]>([]);
    const [gameData, setGameData] = useState<GameData>()

    const socket = useContext(GameSocketContext);
    const joinServer = (gameId : string) => {
        socket.emit("watch", gameId);
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

    socket.on("viewerJoined", (data : GameData) => {
        setGameData(data);
    });
    socket.on("viewerNotJoined", handleError);

    return (
        gameData ?
            <GameSocketProvider>
                <PingPongView gameData={gameData} />
            </GameSocketProvider>
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