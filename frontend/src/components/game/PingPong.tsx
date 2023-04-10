import React, {useState, useEffect, useRef, useContext} from 'react';
import {Ball, GameData, Paddle, Players} from "./interfaces/game-data-props";
import {GameOption} from "./interfaces/game-option";
import {GameSocketContext} from "../context/game-socket";


interface PingPongProps {
    gameOption : GameOption;
}

export default function PingPong(props : PingPongProps) {
    const socket = useContext(GameSocketContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const grid = 15;
    const startTime = new Date().getTime();
    console.log(props.gameOption.ballSpeed);

    const initGame = (data : GameData) => {
        socket.emit("init", data);
    }

    const keyUp = (data : GameData) => {
        socket.emit("KeyUp", data);
    }

    const wKeyDown = (data : GameData) => {
        socket.emit("wKey", data);
    }

    const sKeyDown = (data : GameData) => {
        socket.emit("sKey", data);
    }

    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        let gameData = {
            leftPaddle : {
                x: grid * 2,
                y: canvas.height / 2 - props.gameOption.paddleHeight / 2,
                width: grid,
                height: props.gameOption.paddleHeight,
                dy: 0,
            },
            rightPaddle : {
                x: canvas.width - grid * 3,
                y: canvas.height / 2 - props.gameOption.paddleHeight / 2,
                width: grid,
                height: props.gameOption.paddleHeight,
                dy: 0,
            },
            maxPaddleY : canvas.height - grid - props.gameOption.paddleHeight,
            ball : {
                x: canvas.width / 2,
                y: canvas.height / 2,
                width: grid,
                height: grid,
                resetting: false,
                dx: props.gameOption.ballSpeed,
                dy: -props.gameOption.ballSpeed,
            },
            players : {
                firstPlayer : props.gameOption.firstPlayer,
                firstScore : 0,
                secondPlayer : props.gameOption.secondPlayer,
                secondScore : 0
            },
            timer : 0,
            paddleSpeed : props.gameOption.paddleSpeed,
            ballSpeed : props.gameOption.ballSpeed,
        }
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
        const drawBall = (ball: Ball) => {
            context.fillStyle = "black";
            context.fillRect(ball.x, ball.y, ball.width, ball.height);
        };

        const drawTimer = () => {
            context.font = "bold 18px Arial";
            context.fillStyle = "red";
            context.textAlign = "center";
            const x = 400;
            const y= 15;
            context.fillText(String(gameData.timer), x, y);
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
            if (gameData.ball.resetting) {
                gameData.ball.x = canvas.width / 2;
                gameData.ball.y = canvas.height / 2;
                gameData.ball.resetting = false;
            }
            else {
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
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                    wKeyDown(gameData);
                    break;
                case 's':
                    sKeyDown(gameData);
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'w':
                case 's':
                    keyUp(gameData);
                    break;
            }
    };

        initGame(gameData);
        draw();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        socket.on("update", (data : GameData) => gameData = data);
        socket.on("playerDisconnected", () => setIsPaused(true));
        socket.on("reconnect", () => setIsPaused(false));

        if (isPaused) {
            context.font = "40px Roboto bold";
            context.fillStyle = "red";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        }
        else
            update();
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    return (
        <canvas ref={canvasRef} width={800} height={530} />
    )
}