export interface GameMeta {
    readonly id: string;
    readonly winner: string;
    readonly firstPlayer: string;
    readonly secondPlayer: string;
    readonly firstPlayerScore: string;
    readonly secondPlayerScore : string;
    readonly date: Date;
    readonly finished: boolean;
}