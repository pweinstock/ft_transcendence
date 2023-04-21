import axios from "axios";
import {io} from "socket.io-client";
import { User } from "../BaseInterface";
import React, { useState, useEffect, ChangeEvent } from 'react';

interface ChatProps {
	user : User;
	// chatidp: string;
	chatName : string;
	onUpdate: (newState: string) => void;
}


const PublicChatList: React.FC<ChatProps> = (props : ChatProps) => {

	const [allChat, setallChat] = useState<{id: string, name: string, owner: string, type :string }[]>([]);
	const [publicChats, setpublicChats] = useState<boolean>(false);
	const [chatPassValue, setchatPassValue] = useState<string>("");


	function joinbuttonHandler(id :string) {
		axios.post(`http://${window.location.hostname}:5000/chat/join`,  { userId : props.user.id,  chatId : id, password : chatPassValue }, {withCredentials: true}).then( () => {
			const socket = io("http://localhost:5001/chat" );
			socket?.emit('joinRoom', id);
		}).catch((reason) => {
			if (reason.response!.status !== 200) {
				console.log("Error while joing chat, in chatid:");
				console.log(id);
			}
			console.log(reason.message);
		});
		setchatPassValue("");
	}

	const handleChatPassChange = (event : ChangeEvent<HTMLInputElement>) => {
		setchatPassValue(event.target.value);
	  };
	
	async function getAllPubliChat() {
		try{
			const response = await axios.get(`http://${window.location.hostname}:5000/chat/all`, {withCredentials: true});
			if (response)
			setallChat(response.data);
			// const intersection = allChat.filter(element => props.user.chats.includes(element.id));
			// console.log(allChat);
			// console.log(props.user);
			// console.log(intersection);
			// try to filter the chats already in the list but user chats does not contain the chats from other user. 
			}
			catch(e) {
				console.log("getAllPubliChat chat error");
			}
	}
	
	const changepublic = () => {
		setpublicChats(true);
		setTimeout(() => {
			setpublicChats(false);
		  }, 20000);
	}

	useEffect(() => {
		getAllPubliChat();
	},[props.chatName, publicChats]);

return (
	<>
		<div className='publicchatlist'>
			<p>List of public chats</p>
			<button onClick={changepublic}>Here are the public chats</button>
						<label>
							Password:
							<input type="password" value={chatPassValue} onChange={handleChatPassChange}/>
						</label>
			{publicChats && allChat && allChat.map((item, index) => (
					<div key={item.id} style={{color: "white"}}>
						{item.owner !== props.user.displayName && 
						<>
							<button className='navbutton' onClick={() => {
								joinbuttonHandler(item.id);
							}}>Join {item.name} chat! with: {item.owner} ({item.type})</button>
						</>
						}
					</div>
			))}

		</div>
	</>
);
}

export default PublicChatList;