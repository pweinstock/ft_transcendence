import React, { useState, useEffect, useRef } from 'react';
import { User } from "../BaseInterface";


interface BaseUserProps {
    currentUser : User;
}

const BaseUser: React.FC<BaseUserProps> = (props : BaseUserProps) => {
	
	return (
		<section>
			<h1>Hello {props.currentUser.displayName}</h1>
			<p>Here ill come more information about you</p>
		</section>
	)
}

export default BaseUser