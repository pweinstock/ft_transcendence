import {Chat} from "../../chat.entity";
import {User} from "../../../users/user.entity";

export class AddMessageDto {
    readonly content: string;
    readonly userId: User;
    readonly chatId: Chat;
}
