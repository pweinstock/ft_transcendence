import {Socket} from "socket.io-client";
import axios from "axios";
import {useState} from "react";
import {UserTest} from "../BaseInterface";
import {GameInfo} from "./interfaces/game-info";


interface JoinGame {
    displayName : string,
    gameId : string
}

interface JoinGameProps {
    socket: Socket;
    user : UserTest;
}


export default function JoinGame(props : JoinGameProps) {
    const [gamestoJoin, setGamestoJoin] = useState<GameInfo[]>([]);

    const joinServer = (data : JoinGame) => {
        props.socket.emit("join", data);
    }
    const refreshGames = async () => {
        const response = await axios.get(`http://${window.location.hostname}:5000/game/`);
        if (response && response.status === 200) {
            setGamestoJoin(response.data);
        }
    }

    //toimpement refresh

    return (
        <div style={{color: "white"}}>
            {gamestoJoin && gamestoJoin.map((item) => (
                <button className='navbutton' onClick={() => joinServer({displayName : props.user.displayName, gameId : item.gameId})}>
                    {"Play Against " + item.firstPlayer}
                </button>
            ))}
        </div>
    )
}