import React, { useState, useEffect, useRef } from 'react';
import { BaseInterface, UserTest } from "../BaseInterface";

const BaseUser: React.FC<BaseInterface> = ({currentUser}) => {
	return (
		<section>
			<h1>Hello {currentUser?.displayName}</h1>
			<p>Here ill come more information about you</p>
		</section>
	)
}

export default BaseUser