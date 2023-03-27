import React, { useState, useEffect } from 'react';
import {
    Link
} from "react-router-dom";
import PingPong from "./game/Game"
// import Login from './Login';
// import Groupabout from './groupabout';
// import BuildPost from './postbuilder';



export default function Basic() {

    return (
        <>
            <section>
                 <PingPong/>
            </section>
            <aside>
                <Link className="newpostlink" to="/chat">
                    <button className='buttonside'>Chat</button>
                </Link>
                <Link className="newpostlink" to="/test">
                    <button className='buttonside'>Friends</button>
                </Link>
                <Link className="newpostlink" to="/gameview">
                    <button className='buttonside'>Watch Game</button>
                </Link>
                {/* <Login /> */}
                {/* <Groupabout /> */}
            </aside>
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
