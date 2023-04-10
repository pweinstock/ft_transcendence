import React, {useContext, useEffect, useRef} from 'react';
import {Ball, GameData, Paddle, Players} from "./interfaces/game-data-props";
import {GameSocketContext} from "../context/game-socket";

interface PingPongViewProps {
    gameData : GameData;
}


export default function PingPongView(props : PingPongViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const grid = 15;
    const startTime = new Date().getTime();
    const socket = useContext(GameSocketContext);


    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        let gameData : GameData = props.gameData;

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

                gameData.ball.dx = gameData.ballSpeed * Math.cos(bounceAngle);
                gameData.ball.dy = gameData.ballSpeed * -Math.sin(bounceAngle);
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
            requestAnimationFrame(update);
        };


        draw();
        socket.on("gameUpdate", (data : GameData) => gameData = data);
        update();
    }, []);

    return (
        <canvas ref={canvasRef} width={1200} height={800} />
    )
}