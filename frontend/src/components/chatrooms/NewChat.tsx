import React, { useState, useEffect, ChangeEvent } from 'react';
import astroman from '../img/littleman.png';
import axios from "axios";
import Chat from "../chat/Chat"
import {User} from "../BaseInterface";
import MessageList from './MessageList';
import InputMessage from './InputMessage';
import { ChatSocketProvider } from '../context/chat-socket';
import { color } from '@mui/system';
import { Link } from 'react-router-dom';

interface ChatProps {
	user : User;
	chatidp: string;
	updatestate: number;
	chatName : string;
	onUpdate: (newState: string, deside: boolean) => void;
}

const NewChat: React.FC<ChatProps> = (props : ChatProps) => {
const [usersData, setUsersData] = useState<any[]>([]);
const [usersInThisChat, setusersInThisChat] = useState<{[key: string]: string;}[]>([]);
const [chatData, setchatData] = useState<{bannedUsers: any[], users: any[], admins: any[], mutedUsers
	: any[], owner :string}>();

const [addThisUser, setaddThisUser] = useState<string>("");
const [errorPrint, setErrorPrint] = useState<string>("");
const [chatPassValue, setchatPassValue] = useState<string>("");




const [title, setTitle] = useState('');
const [urlpost, setUrlpost] = useState('');
const [bigtext, setBigtext] = useState('');
const [msg, setmsg] = useState([]);

// const [chatId, setchatId] = useState(0 || chatidp); //set with basic value 0
const handleChatPassChange = (event : ChangeEvent<HTMLInputElement>) => {
	setchatPassValue(event.target.value);
  };
  
useEffect(() => {
    // console.log("massage log");
    async function getChatData() {
        await axios.get("http://localhost:5000/chat/id/" + props.chatidp, {withCredentials: true})
		.then((response) => {
			setchatData(response.data);
			// setmsg(response.data);
			console.log("chat data");
			console.log(response.data);

		});
    }
    getChatData();
}, [props.chatidp, addThisUser, props.updatestate]);

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
	console.log("Users data");
	console.log(usersData);
	setusersInThisChat([]);
	usersData.map((item, index) => (
		item && ( chatData?.users.includes(item.id) ) && (
			setusersInThisChat((arr) => [...arr, {[item.id]: item.displayName}])
			)
			));
			console.log("users in chat");
			console.log(usersInThisChat);

}, [props.chatidp, props.updatestate, usersData, chatData]);

// useEffect(() => {
// 	if (addThisUser !== "" && chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
// 	{
// 		axios.post(`http://${window.location.hostname}:5000/chat/addUser`,  { userId : addThisUser,  chatId : props.chatidp }, {withCredentials: true})
// 		.then( () => {
// 			props.onUpdate("", false);
// 			// setaddThisUser(""); //do i need this?
// 		}).catch((reason) => {
// 			// if (reason.response!.status !== 200) {
// 			// }
// 			console.log(reason.message);
// 			console.log("Error while adding user:");
// 			console.log(addThisUser);
// 			console.log("in chatid:");
// 			console.log(props.chatidp);
// 		});
// 	}
// 	else if (addThisUser !== "")
// 	{
// 		setErrorPrint("Wrong credentials!");
// 	}
// }, [addThisUser, props.updatestate]);



async function addUserHandler() {
	if (addThisUser !== "" && chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/addUser`,  { userId : addThisUser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
			// setaddThisUser(""); //do i need this?
		}).catch((reason) => {

			console.log(reason.message);
			console.log("Error while adding user:");
			console.log(addThisUser);
			console.log("in chatid:");
			console.log(props.chatidp);
		});
	}
}
async function addAsAdminHandler(addadminthisuser: string) {
	if (chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/admin`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
		
				console.log(reason.message);
				console.log("Error while adding user to admins:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});
			
	}
}
async function muteUserInThisChat(addadminthisuser: string) {
	if (chatData && chatData.owner !== addadminthisuser && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/mute`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while muting useer:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});	
	}
}
async function unMuteUserInThisChat(addadminthisuser: string) {
	if (chatData && chatData.owner !== addadminthisuser && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/unmute`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while unmuting useer:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});
			
	}
}
async function removeAdmin(addadminthisuser: string) {
	if (chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/removeAdmin`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while muting useer:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});
			
	}
}

async function blockUser(addadminthisuser: string) {
	if (chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/ban`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while blocking useer:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});		
	}
}

async function unblockUser(addadminthisuser: string) {
	if (chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/unban`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while unblocking useer:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});		
	}
}

async function kickUserout(addadminthisuser: string) {
	if (chatData && (chatData.owner === props.user.id || chatData.admins.includes(props.user.id)))
	{
		await axios.post(`http://${window.location.hostname}:5000/chat/kickoutuser`,  { userId : addadminthisuser,  chatId : props.chatidp }, {withCredentials: true})
		.then( () => {
			props.onUpdate("", false);
		}).catch((reason) => {
				console.log(reason.message);
				console.log("Error while kicking out this user:");
				console.log(addadminthisuser);
				console.log("in chatid:");
				console.log(props.chatidp);
			});		
	}
}

async function leaveChat() {
	await axios.get(`http://${window.location.hostname}:5000/chat/leave/`+  props.chatidp , {withCredentials: true})
		.then(() => {
			props.onUpdate("", false);
		})
		.catch((reason) => {
			console.log("Error leaving chat chat, in chatid:");
			console.log(props.chatidp);
			console.log(reason.message);
		});
}

async function removePasswordl() {
	await axios.get(`http://${window.location.hostname}:5000/chat/deletePass/`+  props.chatidp , {withCredentials: true})
		.then(() => {
			props.onUpdate("", false);
		})
		.catch((reason) => {
			console.log("Error leaving chat chat, in chatid:");
			console.log(props.chatidp);
			console.log(reason.message);
		});

}

function isInAdminorOwner(isThisUserinIT: string): boolean {
	if (chatData && (chatData.owner === isThisUserinIT || chatData.admins.includes(isThisUserinIT)))
		return (true);
	else
		return (false);
}
function isInAdmin(isThisUserinIT: string): boolean {
	if (chatData && (chatData.owner === isThisUserinIT || chatData.admins.includes(isThisUserinIT)))
		return (true);
	else
		return (false);
}

function isMuted(isThisUserinIT: string): boolean {
	if (chatData && chatData.mutedUsers.includes(isThisUserinIT))
		return (true);
	else
		return (false);
}
function isBlocked(isThisUserinIT: string): boolean {
	if (chatData && chatData.bannedUsers.includes(isThisUserinIT))
		return (true);
	else
		return (false);
}
function userIsChatownerr(isThisUserinIT: string): boolean {
	if (chatData && chatData.owner === isThisUserinIT)
		return (true);
	else
		return (false);
}

const [parentState, setParentState] = useState("Initial parent state");

const handleParentStateUpdate = (newState: string) => {
	setParentState(newState);
};

async function handOnClickSend (event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();
	await axios.post(`http://${window.location.hostname}:5000/chat/addPass`,  { chatId : props.chatidp, password: chatPassValue}, {withCredentials: true})
		.then(() => {
			// props.onUpdate("", true);
			setchatPassValue("");
			props.onUpdate("", false);
		}
		).catch(reason => {
			console.log("failed to change password")
			console.log(reason.message);
	});
}

return (
	<>
		<div className='formholder'>
				<div className='chatheader'>
					<div className='usersinchatcontainer'>
					<span>
						{props.chatName} chat with: 
					</span>
						<div className='buttonholderusersinchat'>
							{usersInThisChat && usersInThisChat.map((userObj, index) => (
								<div key={index} className='usersinchatsingle'>
										<Link className="newpostlink" to={"/users/" + Object.values(userObj)} >
											<button>{Object.values(userObj)}</button>
										</Link>
									{ !userIsChatownerr(Object.keys(userObj)[0]) && 
										<>
											{ props.user.id !== Object.keys(userObj)[0] && !isInAdmin(Object.keys(userObj)[0]) && <button title="Add to admin" onClick={() => {
												addAsAdminHandler(Object.keys(userObj)[0]);
											}}>A</button>}
											{ props.user.id !== Object.keys(userObj)[0] && isInAdmin(Object.keys(userObj)[0]) && <button className="redbutton" title="Rewmove admin" onClick={() => {
												removeAdmin(Object.keys(userObj)[0]);
											}}>XA</button>}
											{props.user.id === Object.keys(userObj)[0] && <button className="redbutton" title="leave chat"onClick={() => {
												leaveChat();
											}}>X</button>}
											{props.user.id !== Object.keys(userObj)[0] && <button className="redbutton" title="kick User out"onClick={() => {
												kickUserout(Object.keys(userObj)[0]);
											}}>&#9889;</button>}
											{ props.user.id !== Object.keys(userObj)[0] && !isBlocked(Object.keys(userObj)[0]) && <button title="block this user" onClick={() => {
												blockUser(Object.keys(userObj)[0]);
											}}>&#x26d4;</button>}
											{ props.user.id !== Object.keys(userObj)[0] && isBlocked(Object.keys(userObj)[0]) && <button title="UnBlock this user" onClick={() => {
												unblockUser(Object.keys(userObj)[0]);
											}}>&#9749;</button>}
											{ props.user.id !== Object.keys(userObj)[0] && !isMuted(Object.keys(userObj)[0]) && <button title="Mute this user" onClick={() => {
												muteUserInThisChat(Object.keys(userObj)[0]);
											}}>&#128266;</button>}
											{ props.user.id !== Object.keys(userObj)[0] && isMuted(Object.keys(userObj)[0]) && <button title="UnMute this user" onClick={() => {
												unMuteUserInThisChat(Object.keys(userObj)[0]);
											}}>&#128263;</button>}
										</>
									}
									{userIsChatownerr(Object.keys(userObj)[0]) &&
									<div className='ownercontainerinchat'>
										<div className='ownerboxinchat'>owner</div>
										{ userIsChatownerr(props.user.id) && <div className='hiddenownersettings'>
											<button title="Remove passworld" onClick={() => {
													removePasswordl();
												}}>remove password</button>
											<form onSubmit={handOnClickSend}>
												<label>
													Password:
													<input type="password" value={chatPassValue} onChange={handleChatPassChange}/>
												</label>
												<br/>
												<button className='' type="submit">add/change Passworld</button>
											</form>
										</div>}
									</div>}
								</div>
							))}
						</div>
					</div>
					<div className='adduserdivcontainer'>
						<span>Add users: </span>
						{errorPrint === "Wrong credentials!" && <span style={{color:"red"}}>{errorPrint}</span>}
						{usersData && usersData.map((item, index) => (
							<div key={index} className='adduserdiv' style={{color: "white"}}>
									{item.id !== props.user.id 
										&& chatData 
										&&	!(chatData.users.includes(item.id)) 
										&& <div className='adduserbutandp'>
												<p>
													{item.displayName}
												</p>
												<button className='' onClick={() => {
													setaddThisUser(item.id);
													addUserHandler();
												}} >add</button> 
											</div>
										}
								</div>
							))}
					</div>
				</div>
			<ChatSocketProvider>	
				{chatData && <InputMessage chatThisData={chatData} user={props.user} chatidp={props.chatidp} chatName={props.chatName} onUpdate={handleParentStateUpdate}/>}
			</ChatSocketProvider>
		</div>
	</>
);
}

export default NewChat;
