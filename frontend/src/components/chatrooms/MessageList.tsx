import { useEffect, useState } from 'react';
import './chatstart.css';
import axios from "axios";
import {User} from "../BaseInterface";
import Message from './Message';

interface ChatProps {
	user : User;
	chatidp: string;
	chatName : string;
}

const MessageList: React.FC<ChatProps> = (props : ChatProps) => {

const [messages, setMessages] = useState<{content: string, chat: string, date: Date, id: string, displayName: string, user: string}[]>([]);
const [msg, setmsg] = useState([]);


useEffect(() => {
async function printmessages() {
	await axios.get("http://localhost:5000/chat/messages/" + props.chatidp, {withCredentials: true})
	.then( response => {
		setMessages(response.data);
	})
	.catch((reason) => {
		if (reason.response!.status !== 200) {
		console.log("Error getting massages");
		console.log(props.chatidp);
		console.log(reason.message);
	}
	});
}
printmessages();
}, [props.chatidp]);

return (
	<>
			{messages.map((message) => {
				return (
					<Message key={message.id}
						content={message.content}
						date={message.date.toLocaleString("en-de") + " "}
						displayName={message.displayName}
						user={props.user.displayName}
					/>
				);
			})}
	</>

);
}

export default MessageList;