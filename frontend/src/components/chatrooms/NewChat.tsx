import React, { useState, useEffect } from 'react';
import astroman from '../img/littleman.png';
import axios from "axios";
import Chat from "../chat/Chat"
import {User} from "../BaseInterface";
import MessageList from './MessageList';
import InputMessage from './InputMessage';
import { ChatSocketProvider } from '../context/chat-socket';

interface ChatProps {
user : User;
chatidp: string;
chatName : string;
}

const NewChat: React.FC<ChatProps> = (props : ChatProps) => {
const [usersData, setUsersData] = useState<any[]>([]);

const [title, setTitle] = useState('');
const [urlpost, setUrlpost] = useState('');
const [bigtext, setBigtext] = useState('');
const [msg, setmsg] = useState([]);

// const [chatId, setchatId] = useState(0 || chatidp); //set with basic value 0

// useEffect(() => {
//     // console.log("massage log");
//     async function printmessages() {
//         const response = await axios.get("http://localhost:5000/chat/id/" + props.chatidp, {withCredentials: true});
//         setmsg(response.data);
//         console.log("printmassage");
//         console.log(response.data);
//     }
//     printmessages();
// }, []);

useEffect(() => {
	axios.get(`http://${window.location.hostname}:5000/users`, { withCredentials: true })
		.then((response) => {
			setUsersData(response.data);
		})
		.catch((error) => {
			console.error(error);
			if (error.response && error.response.status !== 200) {
				console.log("error in getting all user data");
			}
		});
		console.log(usersData);
}, []);

function addUserHandler(UserId :string) {
	axios.post(`http://${window.location.hostname}:5000/chat/addUser`,  { userId : UserId,  chatId : props.chatidp }, {withCredentials: true}).then( () => {
	}).catch((reason) => {
		if (reason.response!.status !== 200) {
			console.log("Error while adding user in chatid:");
			console.log(props.chatidp);
		}
		console.log(reason.message);
	});
}


const [parentState, setParentState] = useState("Initial parent state");

const handleParentStateUpdate = (newState: string) => {
	setParentState(newState);
};

function handOnClickSend() {
	let temp = "Anonymus";
	let anopic = astroman;
}

return (
	<>
		<div className='formholder'>

				<div className='chatheader'>
					<span>
						{props.chatName} chat:
					</span>
				</div>
					{/* <MessageList user={props.user} chatidp={props.chatidp} chatName={props.chatName} chatContent={parentState} /> */}
			<ChatSocketProvider>	
				<InputMessage user={props.user} chatidp={props.chatidp} chatName={props.chatName} onUpdate={handleParentStateUpdate}/>
				{/* <Chat  user={props.user} chatidp={props.chatidp} /> */}
			</ChatSocketProvider>
		</div>
	</>
);
}

export default NewChat;
