// di/chatInjection.ts
import { ChatController } from "../controllers/chat/chat.controller";
import { MessageController } from "../controllers/chat/message.controller";
import { ChatService } from "../services/chat/chat.service";
import { MessageService } from "../services/chat/message.service";
import { SocketService } from "../services/chat/socket.service";
import { ChatRepository } from "../repositories/chat.repository";
import { MessageRepository } from "../repositories/message.repository";
import { DtoMapper } from "../dto/dto.mapper";


export const chatDependencies = () => {
  const chatRepository = new ChatRepository();
  const messageRepository = new MessageRepository();

  // DTO mapper instance
  const dtoMapper = new DtoMapper();

  const socketService = new SocketService();
  const chatService = new ChatService(chatRepository, dtoMapper);
  const messageService = new MessageService(messageRepository, dtoMapper);

  const chatController = new ChatController(chatService, socketService);
  const messageController = new MessageController(messageService, chatService, socketService);

  return {
    chatRepository,
    messageRepository,
    chatService,
    messageService,
    chatController,
    messageController,
    dtoMapper,
    socketService,  
  };
};