import {useContext, useEffect, useState} from "react";
import {GameInfo} from "./interfaces/game-info";
import axios from "axios";
import PingPongView from "./PingPongView";
import {GameData} from "./interfaces/game-data-props";
import {GameSocketContext, GameSocketProvider} from "../context/game-socket";
import {Socket} from "socket.io-client";
import React from "react";


export default function WatchGame() {
    const [gamestoWatch, setGamestoWatch] = useState<GameInfo[]>([]);
    const [gameData, setGameData] = useState<GameData>();

    const socket : Socket= useContext(GameSocketContext);
    const joinServer = (gameId : string) => socket.emit("watch", gameId);

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
            <PingPongView gameData={gameData} />
            :
            <div style={{color: "white"}}>
                {gamestoWatch && gamestoWatch.map((item) => (
                    <button className='navbutton' onClick={() => joinServer(item.gameId)}>
                        {item.firstPlayer + "  vs  " + item.secondPlayer}
                    </button>
                ))}
            </div>
    )
}