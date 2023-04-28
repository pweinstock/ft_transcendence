import astroman from './img/littleman.png';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link
  } from "react-router-dom";
import './App.css';
import Basic from './basic';
import ChatRooms from './chatrooms/ChatRooms';
import Login from "./auth/login/Login";
import TwoFactorAuth from "./auth/login/TwoFactorAuth";
import BaseUser from './users/BaseUser';
import React, { useContext, useState, useEffect } from 'react';
import axios from "axios";
import { User } from "./BaseInterface";
import Game from "./game/Game";
import Users from "./users/users";
import {GameSocketProvider} from "./context/game-socket";
import PublicProfile from './users/PublicProfile';
import Friends from './users/Friends';
import {UserSocketContext, UserSocketProvider} from "./context/user-socket";
import {Socket} from "socket.io-client";
import HighScore from './game/HighScore';
import Logout from './auth/login/Logout';




export default function App() {
    const [currentUsersData, setcurrentUsersData] = useState<User>();
    const [userUpdate, setUserUpdate] = useState<boolean>(false);
    const socket : Socket= useContext(UserSocketContext);

    socket.on('userUpdate', () => {
        userUpdate ? setUserUpdate(false) : setUserUpdate(true);
    });

    useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/users/current`, { withCredentials: true })
      .then((response) => {
        setcurrentUsersData(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status !== 200) {
        }
      });
    }, [userUpdate]);
  
    useEffect(() => {
        if (currentUsersData)
            socket?.emit('userConnect',  {userId: currentUsersData.id});
    }, [currentUsersData])

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
                {/* <Route path="/"  element={<Basic />}/> */}
                {currentUsersData &&
                    <>
                    <Route path="/"  element={<Basic  user={currentUsersData}/>}/>
                    <Route path="/chatrooms" element={<ChatRooms user={currentUsersData}/>}/>
                    <Route path="/game" element={<GameSocketProvider><Game user={currentUsersData}/></GameSocketProvider>}/>
                    <Route path="/friends" element={<Friends currentUser={currentUsersData}/>}/>
                    <Route path="/highscore" element={<HighScore currentUser={currentUsersData}/>}/>
                    <Route path="/users/:user" element={<PublicProfile currentUser={currentUsersData}/>}/>
                    </>
                }
            </Routes>
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
              <Link key={"HighScore"}  className="newpostlink" to="/highscore">
                    <button className='navbutton'>HighScore</button>
              </Link>
              <Link key={"friends"}  className="newpostlink" to="/friends">
                  <button className='navbutton'>Friends</button>
              </Link>
            </nav>
          </footer>
        </Router>
      </>
    );
}
