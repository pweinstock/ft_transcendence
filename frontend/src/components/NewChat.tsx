import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import astroman from './img/littleman.png';
import axios from "axios";
import Chat from "./chat/Chat"
import {User} from "./BaseInterface";
// const user = ;

interface ChatProps {
    user : User;
    chatidp: string;
    // chatName : string;
  }

//   export default function NewChat({chatidp}) {
  const NewChat: React.FC<ChatProps> = (props : ChatProps) => {
    const [title, setTitle] = useState('');
    const [urlpost, setUrlpost] = useState('');
    const [bigtext, setBigtext] = useState('');

    const [msg, setmsg] = useState([]); //set with basic value 0
    // const [chatId, setchatId] = useState(0 || chatidp); //set with basic value 0
    // const chatId = chatidp;
    //   console.log(props.user);

    useEffect(() => {
        console.log("massage log");
        async function printmessages() {
            console.log(props.chatidp);
            const response = await axios.get("http://localhost:5000/chat/id/" + props.chatidp, {withCredentials: true});
            setmsg(response.data);
            
            // const messages = response.data;
            console.log(response.data);
        }
        printmessages();
    }, []);

    function handOnClickSend() {
        let temp = "Anonymus";
        let anopic = astroman;
    
    }

    return (
        <>
        {/* <section> */}

            <div className='formholder'>
                <h1>Room  Content goes here</h1>
                <p>{props.chatidp}</p>
                {/* <form>
                    <div className="postlabel">
                        <label htmlFor="subject">Massage</label>
                    </div>
                    <div className="bigtext">
                        <textarea id="subject" name="subject" key="112" placeholder="Write something.." value={bigtext} required></textarea>
                    </div>
                    <Link to="/">
                        <div className="newpostlink">
                        <button type='button' className='submitbut' onClick={handOnClickSend}>send</button>
                        </div>
                    </Link>
                </form> */}
                <Chat  user={props.user} chatidp={props.chatidp} />
            </div>
        {/* </section> */}
        </>

    );
}

export default NewChat;
