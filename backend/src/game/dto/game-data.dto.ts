export class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

export class  Ball {
    x: number;
    y: number;
    width: number;
    height: number;
    resetting: boolean;
    dx: number;
    dy: number;
}

export class Players {
    firstPlayer : string
    firstScore : number
    secondPlayer : string
    secondScore : number
}

export class GameDataDto {
    leftPaddle : Paddle;
    rightPaddle : Paddle;
    maxPaddleY : number;
    ball : Ball;
    players : Players;
    timer : number;
    paddleSpeed :number;
    ballSpeed : number;
    maxScore : number;
    isPaused : boolean;
}