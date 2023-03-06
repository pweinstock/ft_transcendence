import { ChatType } from "../chat.entity";

export class CreateChatDTO {
    readonly userId: number;
    readonly type: ChatType;
    readonly name: string;
    readonly password: string;
}
