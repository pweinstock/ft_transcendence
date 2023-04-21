import React, {useState, useEffect, useContext} from 'react';
import {io, Socket} from "socket.io-client";
import axios from "axios";
import { User } from "../BaseInterface";
import './chatstyle.css';
import NewChat from './NewChat';
import CreateChat from './CreateChat';
import PublicChatList from './PublicChatList';
import {UserSocketContext} from "../context/user-socket";

interface ChatProps {
    user: User;
}

const ChatRooms: React.FC<ChatProps> = (props) => {

const [value, setValue] = useState<{id: string, name: string }[]>([]);
const [chatNameValue, setchatNameValue] = useState<string>("");
const [actualChatid, setactualChatid] = useState<string | undefined>(undefined);
const [actualChatName, setactualChatName] = useState<string | undefined>(undefined);
const [addThisUserId, setaddThisUserId] = useState<string>("");
const [updateStatesGlobal, setaupdateStatesGlobal] = useState<number>(0);

const socket : Socket= useContext(UserSocketContext);

const updateOtherUsers = () =>{
	socket?.emit('update',  {});
}

// listening to any update in the server.
useEffect(() => {
	socket.on("userUpdate", () => {setaupdateStatesGlobal(updateStatesGlobal + 1)});
}, [updateStatesGlobal])



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
},[chatNameValue, value, updateStatesGlobal]);


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
const handleParentStateUpdate = (newState: string, deside: boolean) => {
	if (deside)
		setchatNameValue(newState);
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
								<button className='chatbuttondel' onClick={() => {
									deleteChatNutton(item.id);
									}} >X</button>
							</div>
						))}
					</div>
					<CreateChat chatName={chatNameValue} onUpdate={handleParentStateUpdate}/>
					<PublicChatList user={props.user} chatName={chatNameValue} onUpdate={handleParentStateUpdate}/>
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
