import React, { useState, useEffect, useRef } from 'react';
import {io, Socket} from "socket.io-client";
import {socket} from "../../socket";


interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

interface Ball {
    x: number;
    y: number;
    width: number;
    height: number;
    resetting: boolean;
    dx: number;
    dy: number;
}

interface Players {
    firstPlayer : string
    firstScore : number
    secondPlayer : string
    secondScore : number
}

interface GameData {
    leftPaddle : Paddle;
    rightPaddle : Paddle;
    maxPaddleY : number;
    ball : Ball;
    players : Players;
    timer : number;
    paddleSpeed :number;
}



export default function PingPong() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const grid = 15;
    const paddleHeight = 75;
    const startTime = new Date().getTime();
    let paddleSpeed = 6;
    let ballSpeed = 5;

    const socket = io("localhost:5002/game");


    const gameUpdate = (data : GameData) => {
        socket.emit('gameUpdate', data);
    }

    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        let gameData = {
            leftPaddle : {
                x: grid * 2,
                y: canvas.height / 2 - paddleHeight / 2,
                width: grid,
                height: paddleHeight,
                dy: 0,
            },
            rightPaddle : {
                x: canvas.width - grid * 3,
                y: canvas.height / 2 - paddleHeight / 2,
                width: grid,
                height: paddleHeight,
                dy: 0,
            },
            maxPaddleY : canvas.height - grid - paddleHeight,
            ball : {
                x: canvas.width / 2,
                y: canvas.height / 2,
                width: grid,
                height: grid,
                resetting: false,
                dx: ballSpeed,
                dy: -ballSpeed,
            },
            players : {
                firstPlayer : "",
                firstScore : 0,
                secondPlayer : "",
                secondScore : 0
            },
            timer : 0,
            paddleSpeed : 6
        }

        const drawNet = () => {
            context.beginPath();
            context.setLineDash([7, 15]);
            context.moveTo(canvas.width / 2, 0);
            context.lineTo(canvas.width / 2, canvas.height);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();
        };

        const drawPaddle = (paddle: Paddle) => {
            context.fillStyle = 'black';
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        };
        const drawBall = (ball: Ball) => {
            context.fillStyle = 'black';
            context.fillRect(ball.x, ball.y, ball.width, ball.height);
        };

        const drawTimer = () => {
            context.font = "bold 24px Arial";
            context.fillStyle = "black";
            const x = 200;
            const y= 30;
            context.fillText("Time: " + gameData.timer, x, y);
        };

        const drawScore = (players: Players) => {
            context.font = "bold 24px Arial";
            context.fillStyle = "black";
            const x1 = 10;
            const x2 = 390;
            const y= 30;
            context.fillText("Player 1: " + players.firstScore, x1, y);
            context.fillText("Player 2: " + players.secondScore, x2, y);
        };

        const moveBall = () => {
            if (gameData.ball.resetting) {
                gameData.ball.x = canvas.width / 2;
                gameData.ball.y = canvas.height / 2;
                gameData.ball.resetting = false;
            } else {
                gameData.ball.x += gameData.ball.dx;
                gameData.ball.y += gameData.ball.dy;
            }
        };

        const checkWallCollision = () => {
            if (gameData.ball.y <= 0 || gameData.ball.y + gameData.ball.height >= canvas.height) {
                gameData.ball.dy = -gameData.ball.dy;
            }
            if (gameData.ball.x <= 0) {
                resetBall(gameData.rightPaddle);
                gameData.players.secondScore += 1;
            }
            if (gameData.ball.x + gameData.ball.width >= canvas.width) {
                resetBall(gameData.leftPaddle);
                gameData.players.firstScore += 1;
            }
        };

        const resetBall = (paddle: Paddle) => {
            gameData.ball.resetting = true;
            gameData.ball.dx = -gameData.ball.dx;
            gameData.ball.dy = -gameData.ball.dy;
            gameData.ball.x = paddle.x - gameData.ball.width;
            gameData.ball.y = canvas.height / 2;
        };

        const movePaddle = (paddle: Paddle) => {
            paddle.y += paddle.dy;
            if (paddle.y < grid) {
                paddle.y = grid;
            } else if (paddle.y > gameData.maxPaddleY) {
                paddle.y = gameData.maxPaddleY;
            }
        };

        const checkPaddleCollision = (paddle: Paddle, isLeft : boolean) => {
            if (
                gameData.ball.x < paddle.x + paddle.width &&
                gameData.ball.x + gameData.ball.width > paddle.x &&
                gameData.ball.y < paddle.y + paddle.height &&
                gameData.ball.y + gameData.ball.height > paddle.y
            ) {
                gameData.ball.dx *= -1
                if (isLeft)
                    gameData.ball.x = paddle.x + paddle.width;
                else
                    gameData.ball.x = paddle.x - paddle.width;
                const ballCenter = gameData.ball.y + gameData.ball.height / 2;
                const paddleCenter = paddle.y + paddle.height / 2;
                const centerDiff = ballCenter - paddleCenter;
                const maxBounceAngle = Math.PI / 3;
                let bounceAngle = centerDiff / (paddle.height / 2) * maxBounceAngle;

                if (gameData.ball.dx > 0) {
                    bounceAngle = Math.PI - bounceAngle; // flip angle
                }

                gameData.ball.dx = ballSpeed * Math.cos(bounceAngle);
                gameData.ball.dy = ballSpeed * -Math.sin(bounceAngle);
                gameData.ball.dx *= -1; // switch direction
            }
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawNet();
            drawPaddle(gameData.leftPaddle);
            drawPaddle(gameData.rightPaddle);
            drawBall(gameData.ball);
            drawTimer();
            drawScore(gameData.players);
        };

        const update = () => {
            const currentTime = new Date().getTime();
            gameData.timer = Math.floor((currentTime - startTime) / 1000 % 60);
            moveBall();
            checkWallCollision();
            checkPaddleCollision(gameData.leftPaddle, true);
            checkPaddleCollision(gameData.rightPaddle, false);
            movePaddle(gameData.leftPaddle);
            movePaddle(gameData.rightPaddle);
            draw();
            window.requestAnimationFrame(update);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                    gameData.leftPaddle.dy = -paddleSpeed;
                    gameUpdate(gameData);
                    break;
                case 's':
                    gameData.leftPaddle.dy = paddleSpeed;
                    gameUpdate(gameData);
                    break;
                case 'ArrowUp':
                    gameData.rightPaddle.dy = -paddleSpeed;
                    gameUpdate(gameData);
                    break;
                case 'ArrowDown':
                    gameData.rightPaddle.dy = paddleSpeed;
                    gameUpdate(gameData);
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                case 's':
                    gameData.leftPaddle.dy = 0;
                    gameUpdate(gameData);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    gameData.rightPaddle.dy = 0;
                    gameUpdate(gameData);
                    break;
            }
        };

        draw();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        socket.on("gameUpdate", (data : GameData) =>
            gameData = data
        );

        update();
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [socket]);

    return (
        <canvas ref={canvasRef} width={1200} height={800} />
    )
}