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
                  console.log("fetchchatrooms");
                  console.log(response.data);
                  setValue(response.data);
                }
                catch(e) {
                  console.log("error");
                }
        }
        fetchChatrooms();
    },[]);


    function handOnClickSend() {
        axios.post(`http://${window.location.hostname}:5000/chat/`,  { type : ChatType.PUBLIC,  name : 'testchat'}, {withCredentials: true});

    }

    function joinbuttonHandler() {
            // console.log('joinButton pressed');
            axios.post(`http://${window.location.hostname}:5000/chat/join`,  { userId : "561bdb88-9164-4a34-91a6-0ceb00d1bf6f",  chatId : "5564f6ae-6b85-4160-ba54-bf8ed7d5ccf4"}, {withCredentials: true}).then( () => {
                const socket = io("http://localhost:5001/chat" );
                const chatId = "5564f6ae-6b85-4160-ba54-bf8ed7d5ccf4";
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
                <div>
                     {value && value.map((item, index) => (
                        <div  style={{color: "white"}}>
                            <Link key = {item.id} className="newpostlink" to={"/chat/id/" + item.id}>
                                <button className='chatroombutton'>{item.name} {item.id}</button>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="changingtext">
                    <button onClick={handOnClickSend}>CreatTestChat</button>
                </div>
                <div className="changingtext">
                    <button onClick={joinbuttonHandler}>join</button>
                </div>
            </section>
        </>
    );
}
export default ChatRooms;
