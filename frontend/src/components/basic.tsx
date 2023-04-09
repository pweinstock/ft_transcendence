import { color } from '@mui/system';
import React, { useState, useEffect } from 'react';
import {
    Link
} from "react-router-dom";
import PingPong from "./game/PingPong"
import Login from './auth/login/Login';
import User from './users/users';

export default function Basic() {

    return (
        <>
            <section>
                 <CreateGame/>
            </section>
        </>
    );
}
