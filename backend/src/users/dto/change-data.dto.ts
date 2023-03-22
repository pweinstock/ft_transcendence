import {UserStatus} from "../user.entity";

export class ChangeDataDTO {
    readonly userId: number;
    readonly value: string;
    readonly status : UserStatus;
}