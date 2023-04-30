import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from "axios";
import { User } from '../BaseInterface';

export enum ChatType {
	PUBLIC = "public",
	PRIVATE = "private",
	PROTECTED = "protected",
	DIRECT = "direct",
	};

interface ChatProps {
	usersData : any[];
	chatName : string;
	userId : string;
	onUpdate: (newState: string, deside: boolean) => void;
}

const CreateChat: React.FC<ChatProps> = (props : ChatProps) => {

	const [chaTypeValue, setchaTypeValue] = useState<ChatType>(ChatType.PUBLIC);
	const [chatPassValue, setchatPassValue] = useState<string>("");
	const [gameWithThisUser, setgameWithThisUser] = useState<string>("");
	const [usersData, setUsersData] = useState<any[]>([]);



	const handleChatTypeChange = (event : ChangeEvent<HTMLSelectElement>) => {
		setchaTypeValue(event.target.value as ChatType);
	  };

	const handlegameWithThisUserChange = (event : ChangeEvent<HTMLSelectElement>) => {
		setgameWithThisUser(event.target.value);
	  };
	
	const handleChatNameChange = (event : ChangeEvent<HTMLInputElement>) => {
		props.onUpdate(event.target.value, true);
	  };
	const handleChatPassChange = (event : ChangeEvent<HTMLInputElement>) => {
		setchatPassValue(event.target.value);
	  };

	async function handleGameInviteOnClick (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (gameWithThisUser) {
			axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : ChatType.DIRECT,  name : "Game "}, {withCredentials: true})
				.then((response) => {
						axios.post(`http://${window.location.hostname}:5000/chat/messages`,  { content : "Hey There, Let's play an awesome space-pong game. I click new Game. You click Join!" ,  chatId :response.data.id, date : new Date().toLocaleString("en-de")}, {withCredentials: true})
							.then(() => {
								axios.post(`http://${window.location.hostname}:5000/chat/addUser`,  { userId : gameWithThisUser,  chatId : response.data.id}, {withCredentials: true}).then( () => {
									props.onUpdate("", true);
									props.onUpdate("", false);
									setgameWithThisUser("");
								}).catch((reason) => {
									console.log("Error while joing game chat, in chatid:");
									console.log(gameWithThisUser);
									console.log(reason.message);
								});
							}
							)
							.catch((reason) => {
								console.log("Error while writing instruction maessage");
								});
				}
				).catch(reason => {
					console.log("failed to create game room")
					console.log(reason.message);
			});
		}
	}

	async function handOnClickSend (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// e.preventDefault();
		axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : chaTypeValue,  name : props.chatName, password: chatPassValue}, {withCredentials: true})
			.then(() => {
				props.onUpdate("", true);
				setchatPassValue("");
				props.onUpdate("", false);
			}
			).catch(reason => {
			console.log("failed to post chat!")
			console.log(reason.message);
		});
	}


return (
	<>
		<div className='createchat'>
			<p>Create Chat</p>
			<div className="changingtext">
				<form onSubmit={handOnClickSend}>
					<label>
						Chat Name*:
						<input type="text" value={props.chatName} onChange={handleChatNameChange} required/>
					</label>
					<label>
					Select privacy option*:
					<select value={chaTypeValue}  onChange={handleChatTypeChange} required>
						<option value={ChatType.PUBLIC}>Public</option>
						<option value={ChatType.PRIVATE}>Private</option>
						<option value={ChatType.PROTECTED}>Protected</option>
						<option value={ChatType.DIRECT}>Direct</option>
					</select>
					</label>
					<label>
						Password:
						<input type="password" value={chatPassValue} onChange={handleChatPassChange}/>
					</label>
					<br/>
					<button className='chatbutton' type="submit">Create Chat</button>
				</form>
			</div>
		</div>
		<form onSubmit={handleGameInviteOnClick}>
			<label>
			Select User to play with:
			<select value={gameWithThisUser}  onChange={handlegameWithThisUserChange} required>
				<option key={-1} value={""}>non</option>
			{props.usersData && props.usersData.map((item, index) => (
				 <option key={index} value={item.id} hidden={item.id === props.userId}>{item.displayName}</option>
				 ))}
			</select>
			</label>
			<button className='chatbutton' type="submit">Invite</button>
		</form>
	</>
);
}

export default CreateChat;