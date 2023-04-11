import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';


//todo change to env
const socket = io(window.location.hostname + ":5001" + "/chat"),
    ChatSocketContext = createContext<Socket>(socket);

socket.on('connect', () => console.log('connected to socket'));

const ChatSocketProvider = ({ children }: any) => {
    return (
        <ChatSocketContext.Provider value={socket}>{children}</ChatSocketContext.Provider>
    );
};
export { ChatSocketContext, ChatSocketProvider };