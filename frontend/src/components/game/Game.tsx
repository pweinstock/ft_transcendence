import PingPong from "./PingPong";
import React from "react";
import {io} from "socket.io-client";

export default function Game() {
    const socket = io(`http://${window.location.hostname}:5000/game/`, {
        transports: ["websocket"],
    });


    return (
        <>
            <section>
                <PingPong socket={socket}/>
            </section>
        </>
    );
}