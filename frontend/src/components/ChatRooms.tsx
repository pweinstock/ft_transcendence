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

export enum ChatType {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    DIRECT = "direct",
};

// interface Props {
//     count: number;
//   }

  interface ChatData {
    chatidp: number;
  }

export default function ChatRooms()
{
    const [value, setValue] = useState<{id: number, name: string }[]>([]); //set with basic value 0

    // const chatfuck: ChatData = {
    //     chatidp = 1
    // };
    // const chat: ChatData = {
    //     // name: "John",
    //     chatidp: 30
    //   };
    // const [value, setValue] = useState<Array<{ name: string }>>([]);

    // useEffect(() => {
    //     // This effect uses the `value` variable,
    //     // so it "depends on" `value`.
    //     console.log(value);
    // }, [value]) //if value is dependency the change will trigger the useffect to run.
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat2'}, {withCredentials: true});
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat2'}, {withCredentials: true});


    useEffect(() => {
        async function fetchChatrooms() {
            try{
                const response = await axios.get("http://localhost:5000/chat", {withCredentials: true});
                if (response)
                  console.log(response.data);
                  setValue(response.data);
                }
                catch(e) {
                  //error handling
                  console.log("error");
                }
        }
        fetchChatrooms();
    },[]);


    function handOnClickSend() {
        axios.post("http://localhost:5000/chat/",  { type : ChatType.PUBLIC,  name : 'testchat'}, {withCredentials: true});

    }

    function joinbuttonHandler() {
            // console.log('joinButton pressed');
            axios.post("http://localhost:5000/chat/join",  { userId : 2,  chatId : 1}, {withCredentials: true}).then( () => {
                const socket = io("http://localhost:5001/chat" );
                const chatId = 1;
                socket?.emit('joinRoom', chatId);

    }).catch((reason) => {
                if (reason.response!.status === 400) {
                  // Handle 400
                } else {
                  // Handle else
                }
                console.log(reason.message)
              });
   
     
        const socket = io("http://localhost:5001/chat" );
        const chatId = 1;
        socket?.emit('joinRoom', chatId);
    }

    return (

        <>
            
            <section>
                <div>
                     {value && value.map((item, index) => (
                        <div  style={{color: "white"}}>
                            {/* <Route path={"/chat" + item ? item.id : "empty"} element={<NewChat chatidp={chatidp}/>}/> */}
                            {/* <p style={{color: "white"}} key={index}>{item.name}</p> */}
                            <Link key = {item.id} className="newpostlink" to={"/chat/id/" + item.id}>
                                <button className='chatroombutton'>{item.name} {item.id}</button>
                            </Link>
                        </div>
                    ))}
                    {/* {value.map((item, index) => (
                        <div>

                           <p  key={index}>name of chatroom: {item.name}</p>
                            <div>
                                <p>conent of chatroom:</p>

                            </div>
                        </div>
                    ))} */}
                            {/* <div>
                                <p>Manual conent of chatroom:</p>
                                <p>
                                {msg.content}
                                </p>

                            </div> */}
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

/*
    MESSAGES JSON
    {
        id: number;
        content: string;
        displayName: string;
        createdAt: Date;
        user: number;
        chat: number[];
    }
 */