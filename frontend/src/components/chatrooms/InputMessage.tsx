import { FormEventHandler, useEffect,useRef , useState, ChangeEvent, useContext } from 'react';
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
	chatThisData : {bannedUsers: any[], users: any[], admins: any[], mutedUsers
		: any[], owner :string};
	onUpdate: (newState: string) => void;
}

const InputMessage: React.FC<ChatProps> = (props : ChatProps) => {
	const socket = useContext(ChatSocketContext);
	const [message, setMessage] = useState<string | "">("");
	const [messages, setMessages] = useState<{content: string, date: string, id: string, displayName : string, userId: string}[]>([]);


socket?.emit('joinRoom',  {userId: props.user.id, chatId : props.chatidp});


useEffect(() => {
	setMessages([]);
	}, [props.chatidp]); 

const handleChatinputChange = (event : ChangeEvent<HTMLInputElement>) => {
	setMessage(event.target.value);
};

async function handleOnClickSend(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();
	sendMassagetoBackend();
	Scroll();
	socket?.emit("message", {date: new Date().toLocaleString("en-de"), content : message, userId: props.user.id, chatId : props.chatidp, displayName: props.user.displayName});
	setMessage("");
}

function sendMassagetoBackend() {
	axios.post(`http://${window.location.hostname}:5000/chat/messages`,  { content : message ,  chatId : props.chatidp, date : new Date().toLocaleString("en-de")}, {withCredentials: true})
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

const container = useRef<HTMLDivElement>(null);

const Scroll = () => {
	const {scrollHeight } = container.current as HTMLDivElement;
	container.current?.scrollTo(0, scrollHeight)
}

useEffect(() => {
  Scroll();
}, [messages])

return (
	<>
		<div ref={container} className="message-list">
			<MessageList user={props.user} chatidp={props.chatidp} chatName={props.chatName}/>
			{messages.map((message, index) => {
				return (
					<>
					{ !props.chatThisData.bannedUsers.includes(message.userId) &&
						<Message key={index + props.chatidp}
						content={message.content}
						date={message.date}
						displayName={message.displayName}
						user={props.user.displayName}
						/>
						}
					</>
				);
			})}
		</div>

		<div className="inputgroup">
			<form onSubmit={handleOnClickSend}>
			{!props.chatThisData.mutedUsers.includes(props.user.id) && <input
				type="text"
				id="input-message"
				name="input-message"
				placeholder="type..."
				className="form-control"
				value={message}
				onChange = {handleChatinputChange}
			/>}
			{props.chatThisData.mutedUsers.includes(props.user.id) && <input
				type="text"
				id="input-message"
				name="input-message"
				placeholder="you are muted by admins, RTFM!"
				className="form-control"
				value={message}
				onChange = {handleChatinputChange}
				disabled
			/>}
			<div className="input-group-append">
				<button type="submit" className="chatsendbutton">&#62;</button>
			</div>
			</form>
		</div>
</>

);
}

export default InputMessage;
