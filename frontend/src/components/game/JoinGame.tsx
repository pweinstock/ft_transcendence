import {io} from "socket.io-client";
import axios from "axios";
import React, {useContext, useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext, GameSocketProvider} from "../context/game-socket"

interface JoinGameProps {
    user : User;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);
    const [gameOption, setGameOption] = useState<GameOption>();

    const socket = useContext(GameSocketContext);
    const joinServer = (id : string) => {
        socket.emit("join", {displayName : props.user.displayName, gameId : id});
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

    socket.on("started", (data : GameOption) => {
        setGameOption(data);
    });

    socket.on("notStarted", () => {
        //todo : handle error
    });

    return (
        gameOption ?
            <GameSocketProvider>
                <PingPong gameOption={gameOption}/>
            </GameSocketProvider>
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