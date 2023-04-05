import { colors } from '@mui/material';
import { color } from '@mui/system';
import React, { useState, useEffect, useRef } from 'react';
import {io, Socket} from "socket.io-client";
import axios from "axios";


export enum ChatType {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    DIRECT = "direct",
};

export default function ChatRooms()
{
    // const [value, setValue] = useState(0); //set with basic value 0

    // useEffect(() => {
    //     // This effect uses the `value` variable,
    //     // so it "depends on" `value`.
    //     console.log(value);
    // }, [value]) //if value is dependency the change will trigger the useffect to run.
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat2'}, {withCredentials: true});
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat2'}, {withCredentials: true});

    useEffect(() => {
        async function fetchUser() {
            const response = await axios.get("http://localhost:5000/chat", {withCredentials: true});
            console.log(response);
        }
        fetchUser();
    }, [handOnClickSend]);

    // useEffect(() => {
    //     async function fetchUser() {
    //         const chatId = '1';
    //         const response = await axios.get("http://localhost:5000/id/" + chatId, {withCredentials: true});
    //         const messages = response.data;
    //         console.log(response);
    //     }
    //     fetchUser();
    // }, []);

    function handOnClickSend() {
        axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat'}, {withCredentials: true});

    }
    function handOnClickSend1() {
        const socket = io("http://localhost:5001/chat" );
        const chatId = 1;
        socket?.emit('joinRoom', chatId);
    }

    return (

        <>
        <section>
            <div className="changingtext">
                <button onClick={handOnClickSend}>CreatTestChat</button>
            </div>
            <div className="changingtext">
                <button onClick={handOnClickSend1}>join</button>
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