import React, { useState, useEffect } from 'react';
import astroman from '../img/littleman.png';
import axios from "axios";
import Chat from "../chat/Chat"
import {User} from "../BaseInterface";
import MessageList from './MessageList';

interface ChatProps {
    user : User;
    chatidp: string;
    chatName : string;
  }

  const NewChat: React.FC<ChatProps> = (props : ChatProps) => {
    const [title, setTitle] = useState('');
    const [urlpost, setUrlpost] = useState('');
    const [bigtext, setBigtext] = useState('');
    const [msg, setmsg] = useState([]);
    // const [chatId, setchatId] = useState(0 || chatidp); //set with basic value 0

    // useEffect(() => {
    //     // console.log("massage log");
    //     async function printmessages() {
    //         const response = await axios.get("http://localhost:5000/chat/id/" + props.chatidp, {withCredentials: true});
    //         setmsg(response.data);
    //         console.log("printmassage");
    //         console.log(response.data);
    //     }
    //     printmessages();
    // }, []);

    function handOnClickSend() {
        let temp = "Anonymus";
        let anopic = astroman;
    }

    return (
        <>
            <div className='formholder'>
                <p>{props.chatName}</p>
                <MessageList user={props.user} chatidp={props.chatidp} chatName={props.chatName}/>
                <Chat  user={props.user} chatidp={props.chatidp} />
            </div>
        </>
    );
}

export default NewChat;
