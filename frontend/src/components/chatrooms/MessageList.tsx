import { useEffect, useState } from 'react';
// import Message from './Message';
import './chatstart.css';
import axios from "axios";
import {User} from "../BaseInterface";



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
}

const MessageList: React.FC<ChatProps> = (props : ChatProps) => {

// export default function MessageList() {
const [messages, setMessages] = useState<{content: string, chat: string, date: string, id: string, displayName: string, user: string, type :string }[]>([]);;
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
}, [messages.length]);

//   useEffect(() => {
//   getmassagedata() => {
//           const data = doc.data();
//           list.push({
//             id: doc.id,
//             datetime: new Date(data.datetime.seconds * 1000),
//             sender: data.sender,
//             photoURL: data.photoURL,
//             text: data.text
//           });
//         });
//         setMessages(list);
//       });
//   }, [ messages.length ]);

return (
<>
	<div id="message-list">
	{messages.map((message) => {
		return (
			<div className={ `message ${props.user.displayName !== message.displayName ? 'message-reverse' : ''}` }>
				{/* <div className='aligningbox'> */}

					<div className="datetime">
						<div className="datetime-date">{message.date}</div>
					</div>
					<div className="sender">
						{/* <div className="sender-image">
							<img src={message.photoURL} alt={message.displayName} title={message.displayName} />
						</div> */}
						<div className="sender-name d-none">{message.displayName}</div>
					</div>
						<div className="chattext">{message.content}</div>
				{/* </div> */}
			 </div>
			// <Message key={message.id} message={message} user={props.user} />
		);
	})}
</div>

</>

);
}

export default MessageList;