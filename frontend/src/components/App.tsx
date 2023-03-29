
import React, {useEffect, useState} from 'react'
import Auth from "./auth/Auth";
import {BrowserRouter as Router, Link, Routes, Route} from "react-router-dom";
import Button from "@mui/material/Button/Button";
import PingPong from "./game/Game";
import GameView from "./game/GameView";
import Chat from "./chat/Chat";
import validator from "../hooks/validator";
import Container from "@mui/material/Container/Container";

export default function App() {
    return (
        <div className="App">
            {/*<Button onClick={Auth} variant="contained">42 AUTHENTIFICATION</Button>*/}
        {/*</div>*/}
            <Router>
                <Routes>
                    <Route path="/" element={<PingPong/>}/>
                    <Route path="/GameView" element={<GameView/>}/>
                    <Route path="/Chat" element={<Chat/>}/>
                </Routes>
            </Router>)
        </div>
    )
}



// const [post, setPost] = useState(null);
//
// useEffect(() => {
//     axios.get("http://localhost:5000/users/").then((response) => {
//         setPost(response.data[0].displayName);
//     });
// }, []);
//
//
// if (!post) return null;
//
// return (
//     <div>
//         <h1>{post}</h1>
//     </div>
// );

// return (
//     <div className="App">
//         <Router>
//             <header>
//                 <Link to={"Chat"} > <Button variant="outlined">Authentification</Button></Link>
//             </header>
//             <Routes>
//                 <Route path="/" element={<PingPong/>}/>
//                 <Route path="/GameView" element={<GameView/>}/>
//                 <Route path="/Chat" element={<Chat/>}/>
//             </Routes>
//         </Router>
//     </div>
// )