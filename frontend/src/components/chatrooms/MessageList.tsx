import { useEffect, useState } from 'react';
// import Message from './Message';
import './chatstart.css';
import axios from "axios";
import {User} from "../BaseInterface";
import Message from './Message';



// interfaces user {
//   displayName: string;
// }

// interfaces message {
//   sender: string;
//   photoURL: string;
//   date: string;
//   time: string;
//   text: string;
// }

interface ChatProps {
	user : User;
	chatidp: string;
	chatName : string;
	// chatContent : string;
}

interface MassageStyle {
	content: string;
	date: string;
	id: string;
	displayName: string;
	user: string;
}

const MessageList: React.FC<ChatProps> = (props : ChatProps) => {

// export default function MessageList() {
const [messages, setMessages] = useState<{content: string, chat: string, date: Date, id: string, displayName: string, user: string}[]>([]);
const [msg, setmsg] = useState([]);


useEffect(() => {
// console.log("massage log");
async function printmessages() {
	await axios.get("http://localhost:5000/chat/messages/" + props.chatidp, {withCredentials: true})
	.then( response => {
		setMessages(response.data);
		// console.log("printmassage");
		// console.log(response.data);
	})
	.catch((reason) => {
		if (reason.response!.status !== 200) {
		console.log("Error getting massages");
		console.log(props.chatidp);
	}
	console.log(reason.message);
	});
}
printmessages();
}, [props.chatidp]);

return (
	<>
			{messages.slice(0).reverse().map((message) => {
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