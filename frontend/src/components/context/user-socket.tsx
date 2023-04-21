import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';


//todo change to env
const socket = io(window.location.hostname + ":5003" + "/user"),
    UserSocketContext = createContext<Socket>(socket);

socket.on('connect', () => console.log('connected to socket'));

const UserSocketProvider = ({ children }: any) => {
    return (
        <UserSocketContext.Provider value={socket}>{children}</UserSocketContext.Provider>
    );
};
export { UserSocketContext, UserSocketProvider };