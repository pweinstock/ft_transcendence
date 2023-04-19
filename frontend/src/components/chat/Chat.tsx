import {useEffect, useState} from "react";
import {Socket, io} from "socket.io-client";
import MesageInput from "./messageInput";
import Messages from "./messages";
import { User } from "../BaseInterface";
import axios from "axios";

interface ChatProps {
user : User;
chatidp: string;
}

const Chat: React.FC<ChatProps> = (props : ChatProps) => {


// const Chat: React.FC<BaseInterface> = ({currentUser}, pchatId : string) => {
const [socket, setSocket] = useState<Socket>();
const [messages, setMessages] = useState<string[]>([]);

function sendMassagetoBackend() {
	axios.post(`http://${window.location.hostname}:5000/chat/messages`,  { content : "Hello test massage" ,  chatId : props.chatidp }, {withCredentials: true})
	.catch((reason) => {
			console.log("Error while postint chat message, in chatid:");
			console.log(props.chatidp);
			console.log(reason.message);
		});
}

const send = (value: string) => {
	socket?.emit("message", {content : value, userId: props.user.id, chatId : props.chatidp});
	sendMassagetoBackend();
}

socket?.emit('joinRoom',  {userId: props.user.id, chatId : props.chatidp});

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

export default Chat;