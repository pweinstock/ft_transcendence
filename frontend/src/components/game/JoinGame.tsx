import axios from "axios";
import React, {useContext, useEffect, useState} from "react";
import {User} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";
import PingPong from "./PingPong";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext} from "../context/game-socket"
interface JoinGameProps {
    user : User;
    leaveGame : any;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamesToJoin, setGamesToJoin] = useState<GameInfo[]>([]);
    const [gameOption, setGameOption] = useState<GameOption>();

    const socket = useContext(GameSocketContext);
    const joinServer = (id : string) => {
        socket.emit("join", {displayName : props.user.displayName, gameId : id});
    }

    const getGames = () => {
        axios.get(`http://${window.location.hostname}:5000/game/join`, {withCredentials: true})
            .then(response => {
                if (response && response.status === 200)
                    setGamesToJoin(response.data);
            })
            .catch(e => {
                //todo : handle error
            })
    }

    useEffect(getGames,[])
    socket.on('newPong', getGames);

    socket.on("started", (data : GameOption) => setGameOption(data));

    socket.on("notStarted", () => {
    });

    return (
        gameOption ?
            <>
                <PingPong gameOption={gameOption}/>
                <button className='navbutton' onClick={props.leaveGame}>Leave</button>
            </>
            :
            <div style={{color: "white"}}>
                {gamesToJoin.map((game) => (
                    <button className='navbutton' key={game.gameId} onClick={() => {
                        joinServer(game.gameId)
                    }}>
                        {"Play Against " + game.firstPlayer}
                    </button>
                ))}
            </div>
    )
}