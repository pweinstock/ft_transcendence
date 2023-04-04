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
    const [value, setValue] = useState(0); //set with basic value 0

    // useEffect(() => {
    //     // This effect uses the `value` variable,
    //     // so it "depends on" `value`.
    //     console.log(value);
    // }, [value]) //if value is dependency the change will trigger the useffect to run.
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat'}, {withCredentials: true});
    // axios.post("http://localhost:5000/chat/create",  { type : ChatType.PUBLIC,  name : 'testchat2'}, {withCredentials: true});

    useEffect(() => {
        async function fetchUser() {
            const response = await axios.get("http://localhost:5000/chat", {withCredentials: true});
            console.log(response);
        }
        fetchUser();
    }, []);


    function handOnClickSend() {
        setValue(value + 1);
    }


    return (
        <>
            <div className="changingtext">
                <button onClick={handOnClickSend}>Add Friend</button>
            </div>
        </>
    );
}