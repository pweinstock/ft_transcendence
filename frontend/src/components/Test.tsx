import { colors } from '@mui/material';
import { color } from '@mui/system';
import React, { useState, useEffect, useRef } from 'react';
import {io, Socket} from "socket.io-client";


export default function TestCont()
{
	const [value, setValue] = useState(0); //set with basic value 0

	useEffect(() => {
	// This effect uses the `value` variable,
	// so it "depends on" `value`.
	console.log(value);
	}, [value]) //if value is dependency the change will trigger the useffect to run.

	function handOnClickSend() {
      setValue(value + 1);
    }


	return (
		<>
			<div className="changingtext">
				<h1>I have so many friends!</h1>
				<h4>
					friends count:
				</h4>
				<p>
					{value}
				</p>
				<button onClick={handOnClickSend}>Add Friend</button>
			</div>
		</>
	);
}