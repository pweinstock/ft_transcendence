import {OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: '*',
	},
})
export class ChatGateway {
	@WebSocketServer
	server : Server;
  constructor(private readonly chatService : ChatService) {}

  @SubscribeMessage('createMessage')
  create(
	@MessageBody() dto : CreateMessageDto,
	@ConnectedSocket() client : Socket
  ) {
	const message = await this.chatService.create(dto, client.id);
	this.server.emit('message', message);
	return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
	return this.chatService.findAll();
  }

//   @SubscribeMessage('updateMessage')
//   update(@MessageBody() dto : UpdateMessageDto) {
// 	return this.chatService.update(dto)
//   }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id : number) {
	return this.chatService.remove(id);
  }

  @SubscribeMessage('join')
  joinRoom(
	@MessageBody('name') name : string,
  	@ConnectedSocket() client : Socket
  ) {
	return this.chatService.identify(name, client.id);
  }

  @SubscribeMessage('typing')
  async typing(
	@MessageBody('isTyping') isTyping : boolean,
    @ConnectedSocket() client : Socket
  ) {
	const name = await this.chatService.getChatById(client.id);

	client.brodcast.emit('typing', {name, isTyping});
  }
}
