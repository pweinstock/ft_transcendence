import React, {useContext, useState} from "react";
import {User} from "../BaseInterface";
import {GameSocketContext} from "../context/game-socket"
import PingPongReconnect from "./PingPongReconnect";
import {GameData} from "./interfaces/game-data-props";

interface ReconnectGameProps {
    user : User;
    leaveGame : any;
}

export default function ReconnectGame (props : ReconnectGameProps) {
    const [gameData, setGameData] = useState<GameData>();

    const socket = useContext(GameSocketContext);
    const reconnectClick = () => {
        socket.emit("reconnect");
    }

    socket.on('gameUpdate', (gameData : GameData) => {
        console.log(gameData);
        setGameData(gameData);
    });

    socket.on("notReconnected", props.leaveGame);

    return (
        gameData ?
            <>
                <PingPongReconnect gameData={gameData}/>
                <button className='navbutton' onClick={props.leaveGame}>Leave</button>
            </>
            :
            <button className='navbutton' onClick={reconnectClick}>Reconnect</button>
    )
}