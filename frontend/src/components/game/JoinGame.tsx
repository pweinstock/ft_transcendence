import {Socket} from "socket.io-client";
import axios from "axios";
import {useState} from "react";


interface JoinGame {
    displayName : string,
    gameId : string
}

interface JoinGameProps {
    socket: Socket;
    displayName : string,
    gameId : string
}

interface GameInfo {
    firstPlayer : string;
    gameId : string;
}


export default async function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<string[]>([]);
    const join = (data : JoinGame) => {
        props.socket.emit("join", data);
    }
    const refreshGames = async () => {
        const response = await axios.get(`http://${window.location.hostname}:5000/game/`);
        if (response && response.status === 200) {
            setGamestoJoin(response.data);
        }
    }

    return
}