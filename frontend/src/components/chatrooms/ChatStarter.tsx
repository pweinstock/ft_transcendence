import { useState } from 'react';

import './chatstart.css';
import {User} from "../BaseInterface";

// import Login from './Login';
import InputMessage from './InputMessage';
import MessageList from './MessageList';
// import Logout from './Logout';

interface ChatProps {
user : User;
chatidp: string;
chatName : string;
}

const ChatStarter: React.FC<ChatProps> = (props : ChatProps) => {

// function ChatStarter() {
const [user, setUser] = useState(null);

return (
<div className="App">
		<>
		{/* <InputMessage/> */}
		<InputMessage user={props.user} chatidp={props.chatidp} chatName={props.chatName}/>
		<MessageList user={props.user} chatidp={props.chatidp} chatName={props.chatName}/>
		</>
</div>
);
}

export default ChatStarter;
// { !user && <Login user={user} onLogin={setUser} /> }
// { user && (
//   <>
//     {/* <Logout user={user} /> */}
//     <InputMessage user={user} />
//     <MessageList user={user}/>
//   </>
// ) }