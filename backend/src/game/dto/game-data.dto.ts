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
    readonly leftPaddle : Paddle;
    readonly rightPaddle : Paddle;
    readonly maxPaddleY : number;
    readonly ball : Ball;
    readonly players : Players;
    readonly timer : number;
    readonly paddleSpeed :number;
    readonly ballSpeed : number;
    readonly maxScore : number;
}