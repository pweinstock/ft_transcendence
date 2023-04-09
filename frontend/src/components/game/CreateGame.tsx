import React, { useState } from "react";
import {func} from "prop-types";
import Slider from "@mui/material/Slider/Slider";
import Box from "@mui/material/Box/Box";

interface Options {
    ballSpeed: number;
    paddleSize: number;
    score: number;
}

export default function CreateGame () {
    const marks = [
        {
            value: 3,
            label: 'Slow',
        },
        {
            value: 6,
            label: 'Normal',
        },
        {
            value: 10,
            label: 'Fast',
        },
        {
            value: 14,
            label: 'Super Fast',
        },
    ];

    function valuetext(value: number) {
        return `${value}`;
    }

    function valueLabelFormat(value: number) {
        return marks.findIndex((mark) => mark.value === value) + 1;
    }


    return (
        <div>
            <h2>Create Game</h2>
            <Box sx={{ width: 300 }}>
                <Slider
                    aria-label="Restricted values"
                    defaultValue={20}
                    valueLabelFormat={valueLabelFormat}
                    getAriaValueText={valuetext}
                    step={null}
                    valueLabelDisplay="auto"
                    marks={marks}
                />
            </Box>
        </div>
    );
};