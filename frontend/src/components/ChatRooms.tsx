import { colors } from '@mui/material';
import { color } from '@mui/system';
import React, { useState, useEffect, useRef } from 'react';
import {io, Socket} from "socket.io-client";
import axios from "axios";
import {
BrowserRouter as Router,
Route,
Routes,
Link
} from "react-router-dom";
import NewChat from './NewChat';
import { BrowserRouter } from "react-router-dom";
import { BaseInterface, UserTest } from "./BaseInterface";
import './chatstyle.css';


export enum ChatType {
PUBLIC = "public",
PRIVATE = "private",
PROTECTED = "protected",
DIRECT = "direct",
};

interface ChatData {
chatidp: number;
}

const ChatRooms: React.FC<BaseInterface> = ({currentUser}) => {
const [value, setValue] = useState<{id: number, name: string }[]>([]);


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


function handOnClickSend() {
	axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : ChatType.PUBLIC,  name : 'testchat', password: null}, {withCredentials: true});

}

function joinbuttonHandler() {
	// console.log('joinButton pressed');
	const chatId = "4bbd1c9f-e6a4-4e79-b428-6740ba42eeb5";
	axios.post(`http://${window.location.hostname}:5000/chat/join`,  { userId : currentUser?.id,  chatId : chatId, password : null }, {withCredentials: true}).then( () => {
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
