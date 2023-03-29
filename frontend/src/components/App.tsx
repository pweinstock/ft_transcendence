// import PingPong from "./game/Game"
import Chat from "./chat/Chat"
import astroman from './img/littleman.png';
import {
    BrowserRouter as Router,
    Route,
    Routes
  } from "react-router-dom";
// import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import GameView from "./game/GameView"
import Test from "./Test"
import './App.css';
import Basic from './basic';
import NewChat from './NewChat';

export default function App() {
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
                <Route path="/"  element={<Basic />}/>
                <Route path="/gameview" element={<GameView/>}/>
                <Route path="/chat" element={<Chat/>}/>
                <Route path="/newchat" element={<NewChat/>}/>
                <Route path="/test" element={<Test/>}/>
            </Routes>
          </main>
        </Router>
      </>
    );
}
