import { FormEventHandler, useEffect, useState, ChangeEvent, useContext } from 'react';
import axios from "axios";
import {User} from "../BaseInterface";
import {Socket, io} from "socket.io-client";
import { ChatSocketContext } from '../context/chat-socket';


interface ChatProps {
	user : User;
	chatidp: string;
	chatName : string;
	onUpdate: (newState: string) => void;
}

const InputMessage: React.FC<ChatProps> = (props : ChatProps) => {
const socket = useContext(ChatSocketContext);

const [message, setMessage] = useState<string | "">("");

socket?.emit('joinRoom',  {userId: props.user.id, chatId : props.chatidp});


const handleChatinputChange = (event : ChangeEvent<HTMLInputElement>) => {
	setMessage(event.target.value);
	props.onUpdate(event.target.value);
};

async function handleOnClickSend(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();
	sendMassagetoBackend();
	socket?.emit("message", {content : message, userId: props.user.id, chatId : props.chatidp});
}

function sendMassagetoBackend() {
	axios.post(`http://${window.location.hostname}:5000/chat/messages`,  { content : message ,  chatId : props.chatidp }, {withCredentials: true})
		.then(
			() => setMessage("")
		)
		.catch((reason) => {
			console.log("Error while postint chat message, in chatid:");
			console.log(props.chatidp);
			console.log(reason.message);
			});

}

return (
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
);
}

export default InputMessage;
