export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

export interface Ball {
    x: number;
    y: number;
    width: number;
    height: number;
    resetting: boolean;
    dx: number;
    dy: number;
}

export interface Players {
    firstPlayer : string
    firstScore : number
    secondPlayer : string
    secondScore : number
}

export interface GameDataDto {
    leftPaddle : Paddle;
    rightPaddle : Paddle;
    maxPaddleY : number;
    ball : Ball;
    players : Players;
    timer : number;
    paddleSpeed :number;
}