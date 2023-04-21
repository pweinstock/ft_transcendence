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
	// user : User;
	// chatidp: string;
	chatName : string;
	onUpdate: (newState: string) => void;
}

const CreateChat: React.FC<ChatProps> = (props : ChatProps) => {

	const [chaTypeValue, setchaTypeValue] = useState<ChatType>(ChatType.PUBLIC);
	const [chatPassValue, setchatPassValue] = useState<string>("");

	const handleChatTypeChange = (event : ChangeEvent<HTMLSelectElement>) => {
		setchaTypeValue(event.target.value as ChatType);
	  };
	
	const handleChatNameChange = (event : ChangeEvent<HTMLInputElement>) => {
		props.onUpdate(event.target.value);
	  };
	const handleChatPassChange = (event : ChangeEvent<HTMLInputElement>) => {
		setchatPassValue(event.target.value);
	  };

	async function handOnClickSend (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// e.preventDefault();
		axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : chaTypeValue,  name : props.chatName, password: chatPassValue}, {withCredentials: true})
			.then().catch(reason => {
			console.log("failed to post chat!")
			console.log(reason.message);
		});
		props.onUpdate("");
		setchatPassValue("");
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
	</>
);
}

export default CreateChat;