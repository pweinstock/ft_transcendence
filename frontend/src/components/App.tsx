import PingPong from "./game/Game"
import Chat from "./chat/chat"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import GameView from "./game/GameView"

export default function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/"  element={<PingPong/>}/>
                    <Route path="/GameView" element={<GameView/>}/>
                    <Route path="/Chat" element={<Chat/>}/>
                </Routes>
            </Router>
        </div>
    );
}