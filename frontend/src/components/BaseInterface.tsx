
export enum UserStatus {
    ONLINE = "online",
    INGAME = "ingame",
    OFFLINE = "offline"
};

export interface UserTest {
	id: string;
    email: string;
    displayName: string;
    photo: string;
    status: UserStatus;
    bannedUsers: string[];
    pendingFriends: string[];
    friends: string[];
    chats: string[];
    matchHistory : string[];
    wins : number;
    losses : number;
    draws : number;
    score : number;
	isTwoFactorAuthenticationEnabled: boolean;
	TwoFactorAuthenticationSecret: string;
	first: boolean;
}

export interface BaseInterface {
	currentUser : UserTest;
}