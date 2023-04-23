import React, {useEffect, useRef, useContext} from 'react';
import {Ball, GameData, Paddle, Players} from "./interfaces/game-data-props";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext} from "../context/game-socket";
import {Socket} from "socket.io-client";
import {GameScore} from "./interfaces/game-score";


interface PingPongProps {
    gameData : GameData;
}

export default function PingPongReconnect(props : PingPongProps) {
    const socket : Socket = useContext(GameSocketContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const grid = 15;
    const startTime = new Date().getTime();
    let isEnded : boolean = false;

    useEffect(() => {
        let isPaused : boolean = false;
        let playerLeft : string = "";

        const keyUp = (data : GameData) => socket.emit("KeyUp", data);

        const wKeyDown = (data : GameData) => socket.emit("wKey", data);

        const sKeyDown = (data : GameData) => socket.emit("sKey", data);

        const endGame = (data : GameScore) => socket.emit("end", data);

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;

        const drawNet = () => {
            context.beginPath();
            context.setLineDash([7, 15]);
            context.moveTo(canvas.width / 2, 30);
            context.lineTo(canvas.width / 2, canvas.height);
            context.strokeStyle = "grey";
            context.lineWidth = 2;
            context.stroke();
        };

        const drawPaddle = (paddle: Paddle) => {
            context.fillStyle = "black";
            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        };
        let oldx = props.gameData.ball.x;
        const drawBall = (ball: Ball) => {
            context.fillStyle = "black";
            context.fillRect(ball.x, ball.y, ball.width, ball.height);
            oldx = ball.x;
        };

        const drawTimer = () => {
            context.font = "bold 18px Arial";
            context.fillStyle = "red";
            context.textAlign = "center";
            const x = 400;
            const y= 15;
            context.fillText(String(props.gameData.timer), x, y);
        };

        const drawPause = () => {
            context.font = "40px Roboto bold";
            context.fillStyle = "red";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        };

        const drawEndGame = () => {
            context.font = "40px Roboto bold";
            context.fillStyle = "red";
            context.textAlign = "center";
            context.textBaseline = "middle";
            if (playerLeft !== "")
                context.fillText(playerLeft + " LEFT!", canvas.width / 2, canvas.height / 2);
            else if (props.gameData.players.firstScore > props.gameData.players.secondScore)
                context.fillText(props.gameData.players.firstPlayer + " WON", canvas.width / 2, canvas.height / 2);
            else if (props.gameData.players.firstScore < props.gameData.players.secondScore)
                context.fillText(props.gameData.players.secondPlayer + " WON!", canvas.width / 2, canvas.height / 2);
            else
                context.fillText("DRAW!", canvas.width / 2, canvas.height / 2);
        };

        const drawScore = (players: Players) => {
            context.font = "bold 22px Arial";
            context.fillStyle = "green";
            const x1 = 20;
            const x2 = 780;
            const y= 30;
            context.textAlign = "left";
            context.fillText( players.firstPlayer + " " + players.firstScore, x1, y);
            context.textAlign = "right";
            context.fillText(players.secondPlayer + " " + players.secondScore, x2, y);
        };

        const moveBall = () => {
            if (props.gameData.ball.resetting) {
                props.gameData.ball.x = canvas.width / 2;
                props.gameData.ball.y = canvas.height / 2;
                props.gameData.ball.resetting = false;
            }
            else {
                props.gameData.ball.x += props.gameData.ball.dx;
                props.gameData.ball.y += props.gameData.ball.dy;
            }
        };

        const checkWallCollision = () => {
            if (props.gameData.ball.y <= 0 || props.gameData.ball.y + props.gameData.ball.height >= canvas.height) {
                props.gameData.ball.dy = -props.gameData.ball.dy;
            }
            if (props.gameData.ball.x <= 0) {
                resetBall(props.gameData.rightPaddle);
                props.gameData.players.secondScore += 1;
            }
            if (props.gameData.ball.x + props.gameData.ball.width >= canvas.width) {
                resetBall(props.gameData.leftPaddle);
                props.gameData.players.firstScore += 1;
            }
        };

        const checkScore = () => {
            if (props.gameData.players.secondScore >= props.gameData.maxScore ||
                props.gameData.players.firstScore >= props.gameData.maxScore) {
                endGame({
                    firstPlayerScore: String(props.gameData.players.firstScore),
                    secondPlayerScore: String(props.gameData.players.secondScore)
                });
            }
        }

        const resetBall = (paddle: Paddle) => {
            props.gameData.ball.resetting = true;
            props.gameData.ball.dx = -props.gameData.ball.dx;
            props.gameData.ball.dy = -props.gameData.ball.dy;
            props.gameData.ball.x = paddle.x - props.gameData.ball.width;
            props.gameData.ball.y = canvas.height / 2;
        };

        const movePaddle = (paddle: Paddle) => {
            paddle.y += paddle.dy;
            if (paddle.y < grid) {
                paddle.y = grid;
            } else if (paddle.y > props.gameData.maxPaddleY) {
                paddle.y = props.gameData.maxPaddleY;
            }
        };

        const checkPaddleCollision = (paddle: Paddle, isLeft : boolean) => {
            if (
                props.gameData.ball.x < paddle.x + paddle.width &&
                props.gameData.ball.x + props.gameData.ball.width > paddle.x &&
                props.gameData.ball.y < paddle.y + paddle.height &&
                props.gameData.ball.y + props.gameData.ball.height > paddle.y
            ) {
                props.gameData.ball.dx *= -1
                if (isLeft)
                    props.gameData.ball.x = paddle.x + paddle.width;
                else
                    props.gameData.ball.x = paddle.x - paddle.width;
                const ballCenter = props.gameData.ball.y + props.gameData.ball.height / 2;
                const paddleCenter = paddle.y + paddle.height / 2;
                const centerDiff = ballCenter - paddleCenter;
                const maxBounceAngle = Math.PI / 3;
                let bounceAngle = centerDiff / (paddle.height / 2) * maxBounceAngle;

                if (props.gameData.ball.dx > 0) {
                    bounceAngle = Math.PI - bounceAngle; // flip angle
                }

                props.gameData.ball.dx = props.gameData.ballSpeed * Math.cos(bounceAngle);
                props.gameData.ball.dy = props.gameData.ballSpeed * -Math.sin(bounceAngle);
                props.gameData.ball.dx *= -1; // switch direction
            }
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawNet();
            drawPaddle(props.gameData.leftPaddle);
            drawPaddle(props.gameData.rightPaddle);
            drawBall(props.gameData.ball);
            drawTimer();
            drawScore(props.gameData.players);
        };

        const update = () => {
            const currentTime = new Date().getTime();
            props.gameData.timer = Math.floor((currentTime - startTime) / 1000 % 60);
            moveBall();
            checkScore();
            checkWallCollision();
            checkPaddleCollision(props.gameData.leftPaddle, true);
            checkPaddleCollision(props.gameData.rightPaddle, false);
            movePaddle(props.gameData.leftPaddle);
            movePaddle(props.gameData.rightPaddle);
            draw();
            if (isPaused)
                drawPause()
            else if (isEnded)
                drawEndGame();
            else
                requestAnimationFrame(update);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                    wKeyDown(props.gameData);
                    break;
                case 's':
                    sKeyDown(props.gameData);
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                case 's':
                    keyUp(props.gameData);
                    break;
            }
        };

        draw();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        socket.on("update", (data : GameData) => props.gameData = data);
        socket.on("playerDisconnected", () => isPaused = true);
        socket.on("reconnect", () => isPaused = false);
        socket.on("finished", () => isEnded = true);
        socket.on("left", (player : string) => {
            isEnded = true;
            playerLeft = player
        });



        update();
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, [isEnded]);

    return (
        <canvas ref={canvasRef} width={800} height={530} />
    )
}