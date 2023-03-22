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


export default function App() {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const send = (value : string) => {
        socket?.emit("message", value);
        console.log(socket);
    }
    useEffect(() => {
        // const URL = process.env.URL || 'http://localhost:3000';
        const newSocket = io("http://localhost:5001");
        setSocket(newSocket);
    }, [setSocket]);

    const messageListener = (message : string) => {
        setMessages([...messages, message])
    }
    useEffect(() => {
        socket?.on('message', messageListener)
        return () => {
            socket?.off('message', messageListener)
        }
    }, [messageListener])

    return (
        <div className="App">
            <>
                {" "}
                <MesageInput send={send}/>
                <Messages messages={messages} />
            </>
        </div>
    );
}


