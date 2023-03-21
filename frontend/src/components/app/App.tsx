// import React, {useEffect, useState} from 'react';
// import './App.css';
// import {io, Socket} from "socket.io-client";
//
// function App() {
//   const [socket, setSocket] = useState<Socket>();
//   const [message, setMessage] = useState<string>();
//   const send = (value :string) => {
//     socket?.emit('message', value);
//   }
//   useEffect(() => {
//       const newSocket = io("http://localhost:8001");
//   }, []);
//   return (
//     <div className="App"></div>
//   );
// }
// export default App;

import { useState, useEffect } from 'react';
import {io, Socket} from "socket.io-client";
import Messages from "../chat/messages";
import MesageInput from "../chat/messageInput"
import PingPong from "../game/Game"
import Chat from "../chat/chat"


export default function App() {
    return (
        <div className="App">
            {/*<Chat/>*/}
            <PingPong/>
        </div>
    );
}


