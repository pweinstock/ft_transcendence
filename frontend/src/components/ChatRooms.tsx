import React, { useState, useEffect } from 'react';
import {io} from "socket.io-client";
import axios from "axios";
import { Link } from "react-router-dom";
import { User } from "./BaseInterface";
import './chatstyle.css';


export enum ChatType {
PUBLIC = "public",
PRIVATE = "private",
PROTECTED = "protected",
DIRECT = "direct",
};



interface ChatProps {
    user: User;
}

const ChatRooms: React.FC<ChatProps> = (props) => {
const [value, setValue] = useState<{id: number, name: string }[]>([]);
const [allChat, setallChat] = useState<{id: string, name: string, type :string }[]>([]);


useEffect(() => {
	async function fetchChatrooms() {
		try{
			const response = await axios.get(`http://${window.location.hostname}:5000/chat`, {withCredentials: true});
			if (response)
				// console.log("fetchchatrooms");
				// console.log(response.data);
				setValue(response.data);
			}
			catch(e) {
				console.log("error");
			}
	}
	fetchChatrooms();
},[]);

useEffect(() => {
	async function getAllPubliChat() {
		try{
			const response = await axios.get(`http://${window.location.hostname}:5000/chat/all`, {withCredentials: true});
			if (response)
				setallChat(response.data);
				console.log("chat All");
				console.log(response.data);
			}
			catch(e) {
				console.log("getAllPubliChat chat error");
			}
	}
	getAllPubliChat();
},[]);


function handOnClickSend() {
	axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : ChatType.PUBLIC,  name : 'testchat', password: null}, {withCredentials: true});

}

function joinbuttonHandler() {
	// console.log('joinButton pressed');
	const chatId = "4bbd1c9f-e6a4-4e79-b428-6740ba42eeb5";
	axios.post(`http://${window.location.hostname}:5000/chat/join`,  { userId : props.user.id,  chatId : chatId, password : null }, {withCredentials: true}).then( () => {
		const socket = io("http://localhost:5001/chat" );
		socket?.emit('joinRoom', chatId);

	}).catch((reason) => {
		if (reason.response!.status === 400) {
			// Handle 400
		} else {
			// Handle else
		}
		console.log(reason.message)
		});
	// const socket = io("http://localhost:5001/chat" );
	// const chatId = 1;
	// socket?.emit('joinRoom', chatId);
}

return (
	<>
		<section>
			<div className='chatbox'>
				<div className='chatside'>
					<div className='mychatlist'>
						<p>My Chats:</p>
						{value && value.map((item, index) => (
							<div  style={{color: "white"}}>
								<Link key = {item.id} className="newpostlink" to={"/chat/id/" + item.id}>
									<button className='chatroombutton'>{item.name}</button>
								</Link>
								<button>JoinChat</button>
							</div>
						))}
					</div>
					<div className='createchat'>
						<p>Create Chat</p>
						<div className="changingtext">
							<button onClick={handOnClickSend}>CreatTestChat</button>
						</div>

					</div>
					<div className='publicchatlist'>
						<p>List of public chats</p>
						{allChat && allChat.map((item, index) => (
							<div  style={{color: "white"}}>
									<button className='chatroombutton'>{item.name} {item.type}</button>
							</div>
						))}
						<div className="changingtext">
							<button onClick={joinbuttonHandler}>join</button>
						</div>  

					</div>
				</div>
				<div className='chatcontent'>

				</div>
			</div>

		</section>
	</>
);
}
export default ChatRooms;
