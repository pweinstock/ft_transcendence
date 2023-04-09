import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import astroman from './img/littleman.png';
import axios from "axios";
import Chat from "./chat/Chat"
import { BaseInterface, UserTest } from "./BaseInterface";

const NewChat: React.FC<BaseInterface> = ({currentUser}) => {
    const [title, setTitle] = useState('');
    const [urlpost, setUrlpost] = useState('');
    const [bigtext, setBigtext] = useState('');

    const [msg, setmsg] = useState([]); //set with basic value 0

    useEffect(() => {
        async function printassages() {
            const response = await axios.get("http://localhost:5000/chat/id/" + pchatId, {withCredentials: true});
            setmsg(response.data);
            
            // const messages = response.data;
            console.log(response.data);
        }
        printassages();
    }, []);

    function handOnClickSend() {
        let temp = "Anonymus";
        let anopic = astroman;
    
    }

    return (
        <>
        <section>

            <div className='formholder'>
                <h1>Room {pchatId} Content goes here</h1>
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
                <Chat currentUser={currentUser} />
            </div>
        </section>
        </>

    );
}

export default NewChat;
