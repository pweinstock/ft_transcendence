import React, {useState, useEffect, useContext} from 'react';
import {io, Socket} from "socket.io-client";
import axios from "axios";
import { User } from "../BaseInterface";
import './chatstyle.css';
import NewChat from './NewChat';
import CreateChat from './CreateChat';
import PublicChatList from './PublicChatList';
import {UserSocketContext} from "../context/user-socket";
import Game from '../game/Game';

interface ChatProps {
    user: User;
}

const ChatRooms: React.FC<ChatProps> = (props) => {

const [value, setValue] = useState<{id: string, name: string }[]>([]);
const [chatNameValue, setchatNameValue] = useState<string>("");
const [gamewithfreind, setgamewithfreind] = useState<boolean>(true);
const [actualChatid, setactualChatid] = useState<string | undefined>(undefined);
const [actualChatName, setactualChatName] = useState<string | undefined>(undefined);
const [addThisUserId, setaddThisUserId] = useState<string>("");
const [updateStatesGlobal, setaupdateStatesGlobal] = useState<number>(0);
const [usersData, setUsersData] = useState<any[]>([]);


const socket : Socket= useContext(UserSocketContext);

const updateOtherUsers = () =>{
	socket?.emit('userUpdate',  {});
}

useEffect(() => {
	socket.on("userUpdate", () => {setaupdateStatesGlobal(updateStatesGlobal + 1)});
}, [updateStatesGlobal, setaupdateStatesGlobal])



useEffect(() => {
	fetchChatrooms();
},[updateStatesGlobal]);
	
async function fetchChatrooms() {
	axios.get(`http://${window.location.hostname}:5000/chat`, {withCredentials: true})
	.then((response) => {
		setValue(response.data);
		let chatInList : boolean = false;
			response.data.map((item : any) => {
				if (item.id == actualChatid)
					chatInList = true;});
		if (chatInList == false)
			setactualChatid("");
	})
	.catch((reason) => {
		console.log("Error getting all chat data");
		console.log(reason.message);
	});
}

async function deleteChatNutton(id : string) {
	axios.get(`http://${window.location.hostname}:5000/chat/delete/`+  id , {withCredentials: true})
		.then(() => {
			setchatNameValue("");
			updateOtherUsers();
		})
		.catch((reason) => {
			if (reason.response!.status !== 200) {
				console.log("Error in deleteing chat, in chatid:");
				console.log(id);
			}
			console.log(reason.message);
		});
}

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
	}, [actualChatid, updateStatesGlobal]);

const handleParentStateUpdate = (newState: string, deside: boolean) => {
	if (deside)
	{
		setchatNameValue(newState);
		if (newState === "")
			setactualChatid("");
	}
	else
		updateOtherUsers();
};

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
								<button className='chatbuttondel' title="Delete this chat" onClick={() => {
									deleteChatNutton(item.id);
									setactualChatid("");
									}} >X</button>
							</div>
						))}
					</div>
					<CreateChat userId={props.user.id} usersData={usersData} chatName={chatNameValue} onUpdate={handleParentStateUpdate}/>
					<PublicChatList user={props.user} updatestate={updateStatesGlobal} chatName={chatNameValue} onUpdate={handleParentStateUpdate}/>
				</div>
				</div>
				<div className='chatcontent'>
					{actualChatid && actualChatName && <NewChat usersData={usersData} updatestate={updateStatesGlobal} user={props.user} chatidp={actualChatid} chatName={actualChatName} onUpdate={handleParentStateUpdate}/>}
					{!actualChatid && <h1>No Chat</h1> }
				</div>
			</div>
		</section>
		<aside>
			{gamewithfreind ? <Game user={props.user} /> : <div>Let's Play?</div>}
		</aside>
	</>
);
}
export default ChatRooms;
