import {useEffect, useState} from "react";
import {Socket, io} from "socket.io-client";
import MesageInput from "./messageInput";
import Messages from "./messages";


export default function Chat() {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const send = (value: string) => {
        socket?.emit("message", value);
        console.log(socket);
    }
    useEffect(() => {
        const newSocket = io("http://localhost:5001/chat");
        setSocket(newSocket);
    }, [setSocket]);

    const messageListener = (message: string) => {
        setMessages([...messages, message])
    }
    useEffect(() => {
        socket?.on('message', messageListener)
        return () => {
            socket?.off('message', messageListener)
        }
    }, [messageListener])


    return (
        <>
            {" "}
            <MesageInput send={send}/>
            <Messages messages={messages}/>
        </>
    )
}