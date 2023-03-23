import React, { useState, useEffect, useRef } from 'react';
import {io, Socket} from "socket.io-client";


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
    ballX : number;
    ballY : number;
    paddleLeft : number;
    paddleRight : number;
    ballSpeed : number;
    paddleSpeed : number;
    firstPlayerScore : number;
    secondPlayerScore : number;
    firstPlayer : string;
    secondPlayer :string;
    timer : number;
}


function PingPong(): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    const [socket, setSocket] = useState<Socket>();
    // const [gameData, setGameData] = useState<GameData>();
    var newSocket : Socket;

    const join = (data : number) => {
        socket?.emit("join", data);

    }

    useEffect(() => {
        newSocket = io("http://localhost:5002/game");
        newSocket?.on('connect', function() {
            console.log('check 2', newSocket?.connected);
        });
        setSocket(newSocket);
    }, []);



    // const gameListener = (gameData : GameData) => {
    //     setGameData(gameData);
    // }
    // useEffect(() => {
    //     socket?.on('game', gameListener)
    //     return () => {
    //         socket?.off('game', gameListener)
    //     }
    // }, [gameListener])
    //

    useEffect(() => {
        const canvas = canvasRef.current!;
        let timer = 0;
        const context = canvas.getContext('2d')!;
        const grid = 15;
        const paddleHeight = grid * 5; // 80
        const maxPaddleY = canvas.height - grid - paddleHeight;

        let paddleSpeed = 6;
        let ballSpeed = 5;
        let players : Players = {
            firstPlayer : "",
            firstScore : 0,
            secondPlayer : "",
            secondScore : 0
        };

        const leftPaddle: Paddle = {
            x: grid * 2,
            y: canvas.height / 2 - paddleHeight / 2,
            width: grid,
            height: paddleHeight,
            dy: 0,
        };
        const rightPaddle: Paddle = {
            x: canvas.width - grid * 3,
            y: canvas.height / 2 - paddleHeight / 2,
            width: grid,
            height: paddleHeight,
            dy: 0,
        };
        const ball: Ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: grid,
            height: grid,
            resetting: false,
            dx: ballSpeed,
            dy: -ballSpeed,
        };



        setInterval(() => {
            timer++;
            }, 1000);

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
            context.fillText("Time: " + timer, x, y);
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
            if (ball.resetting) {
                ball.x = canvas.width / 2;
                ball.y = canvas.height / 2;
                ball.resetting = false;
            } else {
                ball.x += ball.dx;
                ball.y += ball.dy;
            }
        };

        const checkWallCollision = () => {
            if (ball.y <= 0 || ball.y + ball.height >= canvas.height) {
                ball.dy = -ball.dy;
            }
            if (ball.x <= 0) {
                resetBall(rightPaddle);
                players.secondScore += 1;
            }
            if (ball.x + ball.width >= canvas.width) {
                resetBall(leftPaddle);
                players.firstScore += 1;
            }
        };

        const resetBall = (paddle: Paddle) => {
            ball.resetting = true;
            ball.dx = -ball.dx;
            ball.dy = -ball.dy;
            ball.x = paddle.x - ball.width;
            ball.y = canvas.height / 2;
        };

        const movePaddle = (paddle: Paddle) => {
            paddle.y += paddle.dy;
            if (paddle.y < grid) {
                paddle.y = grid;
            } else if (paddle.y > maxPaddleY) {
                paddle.y = maxPaddleY;
            }
        };

        const checkPaddleCollision = (paddle: Paddle, isLeft : boolean) => {
            if (
                ball.x < paddle.x + paddle.width &&
                ball.x + ball.width > paddle.x &&
                ball.y < paddle.y + paddle.height &&
                ball.y + ball.height > paddle.y
            ) {
                ball.dx *= -1
                if (isLeft)
                    ball.x = paddle.x + paddle.width;
                else
                    ball.x = paddle.x - paddle.width;
                const ballCenter = ball.y + ball.height / 2;
                const paddleCenter = paddle.y + paddle.height / 2;
                const centerDiff = ballCenter - paddleCenter;
                const maxBounceAngle = Math.PI / 3;
                let bounceAngle = centerDiff / (paddle.height / 2) * maxBounceAngle;

                if (ball.dx > 0) {
                    bounceAngle = Math.PI - bounceAngle; // flip angle
                }

                ball.dx = ballSpeed * Math.cos(bounceAngle);
                ball.dy = ballSpeed * -Math.sin(bounceAngle);
                ball.dx *= -1; // switch direction
            }
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawNet();
            drawPaddle(leftPaddle);
            drawPaddle(rightPaddle);
            drawBall(ball);
            drawTimer();
            drawScore(players);
        };

        const update = () => {
            moveBall();
            checkWallCollision();
            checkPaddleCollision(leftPaddle, true);
            checkPaddleCollision(rightPaddle, false);
            movePaddle(leftPaddle);
            movePaddle(rightPaddle);
            draw();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                    leftPaddle.dy = -paddleSpeed;
                    join(timer);
                    break;
                case 's':
                    leftPaddle.dy = paddleSpeed;
                    break;
                case 'ArrowUp':
                    rightPaddle.dy = -paddleSpeed;
                    break;
                case 'ArrowDown':
                    rightPaddle.dy = paddleSpeed;
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                case 's':
                    leftPaddle.dy = 0;
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    rightPaddle.dy = 0;
                    break;
            }
        };

        draw();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        const intervalId = setInterval(update, 1000 / 60);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            clearInterval(intervalId);
        };
    }, []);

    return (
        <canvas ref={canvasRef} width={1200} height={800} />
    )
}

export default PingPong;