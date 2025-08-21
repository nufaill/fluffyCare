// routes/message.routes.ts
import { RequestHandler, Router } from "express";
import { chatDependencies } from "../di/chatInjection";

const messageRouter = Router();
const { messageController } = chatDependencies;

messageRouter.post("/", messageController.createMessage.bind(messageController) as RequestHandler);
messageRouter.get("/:messageId", messageController.getMessageById.bind(messageController) as RequestHandler);
messageRouter.put("/:messageId/delivered", messageController.markAsDelivered.bind(messageController) as RequestHandler);
messageRouter.put("/:messageId/read", messageController.markAsRead.bind(messageController) as RequestHandler);
messageRouter.put("/mark-multiple-read", messageController.markMultipleAsRead.bind(messageController) as RequestHandler);
messageRouter.delete("/:messageId", messageController.deleteMessage.bind(messageController) as RequestHandler);
messageRouter.post("/:messageId/reactions", messageController.addReaction.bind(messageController) as RequestHandler);
messageRouter.delete("/:messageId/reactions", messageController.removeReaction.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages", messageController.getChatMessages.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages/latest", messageController.getLatestMessage.bind(messageController) as RequestHandler);
messageRouter.put("/chats/:chatId/messages/mark-read", messageController.markChatMessagesAsRead.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages/unread-count", messageController.getUnreadCount.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages/search", messageController.searchMessages.bind(messageController) as RequestHandler);
messageRouter.delete("/chats/:chatId/messages", messageController.deleteChatMessages.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages/by-type/:messageType", messageController.getMessagesByType.bind(messageController) as RequestHandler);
messageRouter.get("/chats/:chatId/messages/stats", messageController.getChatMessageStats.bind(messageController) as RequestHandler);

export { messageRouter };