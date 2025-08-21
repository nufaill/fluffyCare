// di/chatInjection.ts
import { ChatController } from "../controllers/chat/chat.controller";
import { MessageController } from "../controllers/chat/message.controller";
import { ChatService } from "../services/chat/chat.service";
import { MessageService } from "../services/chat/message.service";
import { ChatRepository } from "../repositories/chat.repository";
import { MessageRepository } from "../repositories/message.repository";
import { DtoMapper } from "../dto/dto.mapper"; 

//  repository instances
const chatRepository = new ChatRepository();
const messageRepository = new MessageRepository();

//  DTO mapper instance
const dtoMapper = new DtoMapper();

//  service instances with dependencies
const chatService = new ChatService(chatRepository, dtoMapper);
const messageService = new MessageService(messageRepository, dtoMapper);

//  controller instances with dependencies
const chatController = new ChatController(chatService);
const messageController = new MessageController(messageService);

export const chatDependencies = {
  chatRepository,
  messageRepository,
  chatService,
  messageService,
  chatController,
  messageController,
  dtoMapper
};