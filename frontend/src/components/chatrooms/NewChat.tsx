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
	updatestate: number;
	chatName : string;
}

const NewChat: React.FC<ChatProps> = (props : ChatProps) => {
const [usersData, setUsersData] = useState<any[]>([]);
const [chatData, setchatData] = useState<{users: any[]}>();

const [addThisUser, setaddThisUser] = useState<string>("");
const [title, setTitle] = useState('');
const [urlpost, setUrlpost] = useState('');
const [bigtext, setBigtext] = useState('');
const [msg, setmsg] = useState([]);

// const [chatId, setchatId] = useState(0 || chatidp); //set with basic value 0

useEffect(() => {
    // console.log("massage log");
    async function getChatData() {
        await axios.get("http://localhost:5000/chat/id/" + props.chatidp, {withCredentials: true})
		.then((response) => {
			setchatData(response.data);
			// setmsg(response.data);
			// console.log("chat data");
			// console.log(response.data);

		});
    }
    getChatData();
}, [props.chatidp]);

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
	}, [props.chatidp, props.updatestate]);

useEffect(() => {
	console.log(usersData);
}, [props.chatidp, props.updatestate]);

useEffect(() => {
	if (addThisUser !== "")
	{
		axios.post(`http://${window.location.hostname}:5000/chat/addUser`,  { userId : addThisUser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			// setaddThisUser(""); //do i need this?
		}).catch((reason) => {
			if (reason.response!.status !== 200) {
				console.log("Error while adding user:");
				console.log(addThisUser);
				console.log("in chatid:");
				console.log(props.chatidp);
			}
			console.log(reason.message);
		});
	}
}, [addThisUser]);



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
					{usersData && usersData.map((item, index) => (
							<div key={index} className='' style={{color: "white"}}>
								{item.id !== props.user.id 
									&& chatData 
									&&	!(chatData.users.includes(item.id)) 
									&& <button className='' onClick={() => {
										setaddThisUser(item.id);
									}} >add {item.displayName}</button>}
							</div>
						))}
				</div>
			<ChatSocketProvider>	
				<InputMessage user={props.user} chatidp={props.chatidp} chatName={props.chatName} onUpdate={handleParentStateUpdate}/>
			</ChatSocketProvider>
		</div>
	</>
);
}

export default NewChat;
