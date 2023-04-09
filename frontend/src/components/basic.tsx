import { color } from '@mui/system';
import React, { useState, useEffect } from 'react';
import {
    Link
} from "react-router-dom";
import PingPong from "./game/PingPong"
import Login from './auth/login/Login';
import User from './users/users';
import {io} from "socket.io-client";
import CreateGame from "./game/CreateGame";
// import Groupabout from './groupabout';
// import BuildPost from './postbuilder';



export default function Basic() {

    return (
        <>
            <section>
                 <CreateGame/>
            </section>
        </>
    );
}

//   <Route path="/newpost">
    // <NewPost />
//   </Route> 
// <div className="App">
//     <Router>
//         <Routes>
//             <Route path="/"  element={<PingPong/>}/>
//             <Route path="/GameView" element={<GameView/>}/>
//             <Route path="/Chat" element={<Chat/>}/>
//             <Route path="/Test" element={<Test/>}/>
//         </Routes>
//     </Router>
// </div>

                // <Link className="newpostlink" to="/chat">
                //     <button className='buttonside'>Chat</button>
                // </Link>
                // <Link className="newpostlink" to="/chatrooms">
                //     <button className='buttonside'>ChatRooms</button>
                // </Link>
                // <Link className="newpostlink" to="/newchat">
                //     <button className='buttonside'>Send Massage</button>
                // </Link>
                // <Link className="newpostlink" to="/test">
                //     <button className='buttonside'>Friends</button>
                // </Link>
                // <Link className="newpostlink" to="/gameview">
                //     <button className='buttonside'>Watch Game</button>
                // </Link>
                // <Link className="newpostlink" to="/users">
                //     <button className='buttonside'>Users</button>
                // </Link>
                // <Link className="newpostlink" to="/settings">
                //     <button className='buttonside'>Settings</button>
                // </Link>