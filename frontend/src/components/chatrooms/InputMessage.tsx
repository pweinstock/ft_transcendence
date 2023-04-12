import { FormEventHandler, useEffect, useState, ChangeEvent, useContext } from 'react';
import axios from "axios";
import {User} from "../BaseInterface";
import {Socket, io} from "socket.io-client";
import { ChatSocketContext } from '../context/chat-socket';
import MessageList from './MessageList';
import Message from './Message';



interface ChatProps {
	user : User;
	chatidp: string;
	chatName : string;
	onUpdate: (newState: string) => void;
}

const InputMessage: React.FC<ChatProps> = (props : ChatProps) => {
const socket = useContext(ChatSocketContext);

const [message, setMessage] = useState<string | "">("");
const [messages, setMessages] = useState<{content: string, date: string, id: string}[]>([]);


socket?.emit('joinRoom',  {userId: props.user.id, chatId : props.chatidp});


useEffect(() => {
	setMessages([]);
	}, [props.chatidp]); 
	//when we call it with a different chat id its triggers the clearing fo the variable handleled by the usstate

const handleChatinputChange = (event : ChangeEvent<HTMLInputElement>) => {
	setMessage(event.target.value);
	props.onUpdate(event.target.value);
};

async function handleOnClickSend(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();
	sendMassagetoBackend();
	socket?.emit("message", {content : message, userId: props.user.id, chatId : props.chatidp});
	setMessage("");
}

function sendMassagetoBackend() {
	axios.post(`http://${window.location.hostname}:5000/chat/messages`,  { content : message ,  chatId : props.chatidp }, {withCredentials: true})
		.then(
		)
		.catch((reason) => {
			console.log("Error while postint chat message, in chatid:");
			console.log(props.chatidp);
			console.log(reason.message);
			});
}

const messageListener = (message: any) => {
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
		<div className="message-list">
			<MessageList user={props.user} chatidp={props.chatidp} chatName={props.chatName}/>
			{messages.map((message) => {
			return (
				<Message key={message.id + "bob"}
					content={message.content}
					date={"2023-04-12T17:29:19.591Z"}
					id={message.id}
					displayName={props.user.displayName}
					user={props.user.displayName}
				/>
			);
		})}
		</div>

		<div className="inputgroup">
			<form onSubmit={handleOnClickSend}>
			<input
				type="text"
				id="input-message"
				name="input-message"
				placeholder="type..."
				className="form-control"
				value={message}
				onChange = {handleChatinputChange}
			/>
			<div className="input-group-append">
				<button type="submit" className="chatsendbutton">&#62;</button>
			</div>
			</form>
		</div>
</>

);
}

export default InputMessage;
