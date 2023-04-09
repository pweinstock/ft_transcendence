import {ChatType} from "../chat.entity";

export class ChatPublicDataDto {
    readonly id: string;
    readonly name : string;
    readonly type : ChatType;
}
