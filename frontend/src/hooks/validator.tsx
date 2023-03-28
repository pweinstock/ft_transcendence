import axios from "axios";
import React, {useEffect, useState} from "react";



export default async function validator () : Promise<number> {
    const baseURL = 'localhost:' + process.env.PORT + '/validate'
    const response = await axios.get(baseURL);
    if (response.status === 200)
        return response.data;
    return -1;
}