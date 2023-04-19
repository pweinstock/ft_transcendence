import React, { useState, useEffect, ChangeEvent } from 'react';
import {io} from "socket.io-client";
import axios from "axios";
import { Link } from "react-router-dom";
import { User } from "../BaseInterface";
import './chatstyle.css';
import NewChat from './NewChat';


export enum ChatType {
PUBLIC = "public",
PRIVATE = "private",
PROTECTED = "protected",
DIRECT = "direct",
};



interface ChatProps {
    user: User;
}

interface CreateChatForm {
    chaTypeValue: ChatType;
	chatNameValue: string;
	chatPassValue: string;
	actualChatid: string;
}

const ChatRooms: React.FC<ChatProps> = (props) => {

const [value, setValue] = useState<{id: string, name: string }[]>([]);
const [allChat, setallChat] = useState<{id: string, name: string, owner: string, type :string }[]>([]);
const [chaTypeValue, setchaTypeValue] = useState<ChatType>(ChatType.PUBLIC);
const [chatNameValue, setchatNameValue] = useState<string>("");
const [chatPassValue, setchatPassValue] = useState<string | undefined>(undefined);
const [actualChatid, setactualChatid] = useState<string | undefined>(undefined);
const [actualChatName, setactualChatName] = useState<string | undefined>(undefined);


useEffect(() => {
	async function fetchChatrooms() {
		try{
			const response = await axios.get(`http://${window.location.hostname}:5000/chat`, {withCredentials: true});
			if (response)
				setValue(response.data);
			}
			catch(e) {
				console.log("error");
			}
	}
	fetchChatrooms();
},[chatNameValue, value]);

useEffect(() => {
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
	getAllPubliChat();
},[chatNameValue]);

const handleChatTypeChange = (event : ChangeEvent<HTMLSelectElement>) => {
    setchaTypeValue(event.target.value as ChatType);
  };

const handleChatNameChange = (event : ChangeEvent<HTMLInputElement>) => {
    setchatNameValue(event.target.value);
  };
const handleChatPassChange = (event : ChangeEvent<HTMLInputElement>) => {
    setchatPassValue(event.target.value);
  };

async function handOnClickSend (event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();
	// e.preventDefault();
    axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : chaTypeValue,  name : chatNameValue, password: chatPassValue}, {withCredentials: true})
        .then().catch(reason => {
        console.log("failed to post chat!")
        console.log(reason.message);
    });
	setchatNameValue("");
}

async function deleteChatNutton(id : string) {
	axios.get(`http://${window.location.hostname}:5000/chat/delete/`+  id , {withCredentials: true})
		.catch((reason) => {
		if (reason.response!.status !== 200) {
			console.log("Error in deleteing chat, in chatid:");
			console.log(id);
		}
		console.log(reason.message);
		});
		setchatNameValue("");
}

// function sclickAndSetActual(id : string) {

// }

function joinbuttonHandler(id :string) {
	axios.post(`http://${window.location.hostname}:5000/chat/join`,  { userId : props.user.id,  chatId : id, password : null }, {withCredentials: true}).then( () => {
		const socket = io("http://localhost:5001/chat" );
		socket?.emit('joinRoom', id);
	}).catch((reason) => {
		if (reason.response!.status !== 200) {
			console.log("Error while joing chat, in chatid:");
			console.log(id);
		}
		console.log(reason.message);
		});
}
return (
	<>
		<section>
			<div className='chatbox'>
				<div className='chatside'>
				<div className='toborderside'>
					<div className='mychatlist'>
						<p>My Chats:</p>
						{value && value.map((item, index) => (
							<div key={item.id} className='buttonholder' style={{color: "white"}}>
									<button className='chatbutton' onClick={() => {
									setactualChatid(item.id);
									setactualChatName(item.name);
									}} >{item.name}</button>
								<button className='chatbuttondel' onClick={() => {
									deleteChatNutton(item.id);
									}} >X</button>
							</div>
						))}
					</div>
					<div className='createchat'>
						<p>Create Chat</p>
						<div className="changingtext">
						<form onSubmit={handOnClickSend}>
							<label>
								Chat Name*:
								<input type="text" value={chatNameValue} onChange={handleChatNameChange} required/>
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
					<div className='publicchatlist'>
						<p>List of public chats</p>
						{allChat && allChat.map((item, index) => (
								<div key={item.id} style={{color: "white"}}>
									{item.owner !== props.user.displayName && 
										<button className='navbutton' onClick={() => {
											joinbuttonHandler(item.id);
											}}>Join {item.name} chat! with: {item.owner} ({item.type})</button>
									}
								</div>
						))}

					</div>
				</div>
				</div>
				<div className='chatcontent'>
					{actualChatid && actualChatName && <NewChat user={props.user} chatidp={actualChatid} chatName={actualChatName}/>}
					{!actualChatid && <h1>No Chat</h1> }

				</div>
			</div>

		</section>
	</>
);
}
export default ChatRooms;
