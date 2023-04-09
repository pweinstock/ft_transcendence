import {useEffect, useState} from "react";
import {Socket, io} from "socket.io-client";
import MesageInput from "./messageInput";
import Messages from "./messages";


export default function Chat() {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const send = (value: string) => {
        socket?.emit("message", {content : value, userId: "0acaf517-5050-467d-b4f9-5380547105c2", chatId : "5564f6ae-6b85-4160-ba54-bf8ed7d5ccf4"});
    }

    const chatId = "5564f6ae-6b85-4160-ba54-bf8ed7d5ccf4";
    socket?.emit('joinRoom',  {userId: "0acaf517-5050-467d-b4f9-5380547105c2", chatId : "5564f6ae-6b85-4160-ba54-bf8ed7d5ccf4"});

    useEffect(() => {
        const newSocket = io("http://localhost:5001/chat");
        setSocket(newSocket);
    }, [setSocket]);

    const messageListener = (message: any) => {
        setMessages([...messages, message.content])
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
            <p>here from Chat--</p>
            <MesageInput send={send}/>
            <Messages messages={messages}/>
        </>
    )
}