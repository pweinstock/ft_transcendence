import { ChatType } from "../chat.entity";

export class CreateChatDTO {
    readonly owner: number;
    readonly type: ChatType;
    readonly name: string;
    readonly password: string;
}
