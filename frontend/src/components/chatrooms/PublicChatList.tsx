import axios from "axios";
import {io} from "socket.io-client";
import { User } from "../BaseInterface";
import React, { useState, useEffect, ChangeEvent } from 'react';

interface ChatProps {
	user : User;
	updatestate :number;
	chatName : string;
	onUpdate: (newState: string, deside: boolean) => void;
}


const PublicChatList: React.FC<ChatProps> = (props : ChatProps) => {

	const [allChat, setallChat] = useState<{id: string, name: string, owner: string, type :string }[]>([]);
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
		}
		catch(e) {
			console.log("getAllPubliChat chat error");
		}
	}
	
	useEffect(() => {
		getAllPubliChat();
	},[props.chatName, props.updatestate]);

return (
	<>
		<div className='publicchatlist'>
			<p>List of public chats</p>
						<label>
							Password:
							<input type="password" value={chatPassValue} onChange={handleChatPassChange}/>
						</label>
			{allChat && allChat.map((item, index) => (
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