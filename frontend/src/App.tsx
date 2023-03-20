import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {io, Socket} from "socket.io-client";
import {string} from "prop-types";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [message, setMessage] = useState<string>();
  const send = (value :string) => {
    socket?.emit('message', value);
  }
  useEffect(() => {
      const newSocket = io("http://localhost:8001");
  }, []);
  return (
    <div className="App"></div>
  );
}

export default App;
