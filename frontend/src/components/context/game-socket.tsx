import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';


//todo change to env
const socket = io(window.location.hostname + ":5002" + "/game", {transports: ["websocket"]}),
    GameSocketContext = createContext<Socket>(socket);

const GameSocketProvider = ({ children }: any) => {
    return (
        <GameSocketContext.Provider value={socket}>{children}</GameSocketContext.Provider>
    );
};
export { GameSocketContext, GameSocketProvider };