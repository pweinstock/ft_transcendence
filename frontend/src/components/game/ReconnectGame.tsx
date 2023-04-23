import React, {useContext, useState} from "react";
import {User} from "../BaseInterface";
import {GameSocketContext} from "../context/game-socket"
import PingPongReconnect from "./PingPongReconnect";
import {GameData} from "./interfaces/game-data-props";

interface ReconnectGameProps {
    user : User;
    setStarted : React.Dispatch<React.SetStateAction<any>>;
    setInGame : React.Dispatch<React.SetStateAction<any>>;
}

export default function ReconnectGame (props : ReconnectGameProps) {
    const [gameData, setGameData] = useState<GameData>();

    const socket = useContext(GameSocketContext);
    const reconnectClick = () => {
        socket.emit("reconnect", {displayName : props.user.displayName});
    }

    socket.on('reconnected', (gameData : GameData) => {
        setGameData(gameData);
        props.setStarted(true);
    });

    socket.on("notReconnected", () => {
        //todo : handle error
        props.setInGame(false);
    });

    return (
        gameData ?
            <PingPongReconnect gameData={gameData}/>
            :
            <button className='navbutton' onClick={reconnectClick}>Reconnect</button>
    )
}