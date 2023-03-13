import {OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {ChatService} from "./chat.service";

@WebSocketGateway({namespace: 'messages'})
export class ChatGateway implements OnGatewayInit{
  constructor(private readonly chatService : ChatService) {}

  afterInit() : void {
    console.log('connection established!');
  }
}
