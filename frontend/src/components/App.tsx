// import PingPong from "./game/Game"
import astroman from './img/littleman.png';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link
  } from "react-router-dom";
// import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import './App.css';
import Basic from './basic';
import NewChat from './chatrooms/NewChat';
import ChatRooms from './chatrooms/ChatRooms';
import Login from "./auth/login/Login";
import TwoFactorAuth from "./auth/login/TwoFactorAuth";
import Settings2 from "./settings/settings2";
import BaseUser from './users/BaseUser';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { User } from "./BaseInterface";
import Game from "./game/Game";
import Users from "./users/users";
import {GameSocketProvider} from "./context/game-socket";
import PublicProfile from './users/PublicProfile';



export default function App() {

  const [value, setValue] = useState<{id: number, name: string }[]>([]); 
  const [currentUsersData, setcurrentUsersData] = useState<User>();

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true })
      .then((response) => {
        setcurrentUsersData(response.data);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status !== 200) {
          console.log("Error get current user....");
        }
      });
  }, []);

    return (
        <>
        <Router>
          <header>
            <div>
              <img src={astroman} alt="little astronout"></img>
            </div>
            <p>42 SPACE-PONG</p>
          </header>
          <main>
            <Routes>
                <Route path="/auth" element={<Login/>}/>
                <Route path="/auth/2FA" element={<TwoFactorAuth/>}/>
                <Route path="/"  element={<Basic />}/>
                <Route path="/settings"  element={<Settings2 />}/>
                {/*<Route path="/chat" element={<Chat/>}/>*/}
                {/*<Route path="/newchat" element={<NewChat/>}/> */}
                {/*<Route path="/test" element={<Test/>}/>*/}
                {/*<Route path="/gameview" element={<GameView/>}/>*/}
                {currentUsersData &&
                    <>
                    <Route path="/chatrooms" element={<ChatRooms user={currentUsersData}/>}/>
                        <Route path="/game" element={<GameSocketProvider><Game user={currentUsersData}/></GameSocketProvider>}/>
                    <Route path="/users" element={<BaseUser currentUser={currentUsersData}/>}/>
                    <Route path="/users/:user" element={<PublicProfile currentUser={currentUsersData}/>}/>
                    </>
                }
            </Routes>
            <aside>
              {!currentUsersData && <Login />}
              {currentUsersData && <Users />}
            </aside>
          </main>
          <footer>
            <nav>
              <Link key={"home"} className="newpostlink" to="/">
                    <button className='navbutton'>Home</button>
                </Link>
              <Link key={"chatroom"} className="newpostlink" to="/chatrooms">
                    <button className='navbutton'>ChatRooms</button>
              </Link>
              <Link key={"game"}  className="newpostlink" to="/game">
                    <button className='navbutton'>Game</button>
              </Link>
              <Link key={"users"}  className="newpostlink" to="/users">
                    <button className='navbutton'>Users</button>
                </Link>
                {/*<Link key={"friends"}  className="newpostlink" to="/friends">*/}
                    {/*<button className='navbutton'>Friends</button>*/}
                {/*</Link>*/}
                <Link key={"settings"}  className="newpostlink" to="/settings">
                    <button className='navbutton'>Settings</button>
                </Link>
            </nav>
          </footer>
        </Router>
      </>
    );
}
