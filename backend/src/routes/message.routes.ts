import { RequestHandler, Router } from "express";
import { chatDependencies } from "../di/chatInjection";

const router = Router();

const { messageController } = chatDependencies();

// Now use messageController methods
router.post("/", messageController.createMessage.bind(messageController) as RequestHandler);
router.get("/:messageId", messageController.getMessageById.bind(messageController) as RequestHandler);
router.put("/:messageId/delivered", messageController.markAsDelivered.bind(messageController) as RequestHandler);
router.put("/:messageId/read", messageController.markAsRead.bind(messageController) as RequestHandler);
router.put("/mark-multiple-read", messageController.markMultipleAsRead.bind(messageController) as RequestHandler);
router.delete("/:messageId", messageController.deleteMessage.bind(messageController) as RequestHandler);
router.post("/:messageId/reactions", messageController.addReaction.bind(messageController) as RequestHandler);
router.delete("/:messageId/reactions", messageController.removeReaction.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages", messageController.getChatMessages.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages/latest", messageController.getLatestMessage.bind(messageController) as RequestHandler);
router.put("/chats/:chatId/messages/mark-read", messageController.markChatMessagesAsRead.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages/unread-count", messageController.getUnreadCount.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages/search", messageController.searchMessages.bind(messageController) as RequestHandler);
router.delete("/chats/:chatId/messages", messageController.deleteChatMessages.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages/by-type/:messageType", messageController.getMessagesByType.bind(messageController) as RequestHandler);
router.get("/chats/:chatId/messages/stats", messageController.getChatMessageStats.bind(messageController) as RequestHandler);

export default router;
