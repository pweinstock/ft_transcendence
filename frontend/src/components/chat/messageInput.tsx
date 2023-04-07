import React, {useState} from 'react'

export default function MessageInput({send} : {send :(value : string) => void}) {
    const [value, setValue] = useState("");
    return (
        <>
            <label htmlFor="msgfield">write</label>
            <input
                className="bigtext"
                id="msgfield"
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter message"
                value={value}/>
            
            <button onClick={() => send(value)}>Send</button>
        </>
    )
}