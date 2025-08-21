// routes/chat.routes.ts
import { RequestHandler, Router } from "express";
import { chatDependencies } from "../di/chatInjection";

const chatRouter = Router();
const { chatController } = chatDependencies;
chatRouter.post("/", chatController.createChat.bind(chatController) as RequestHandler);
chatRouter.post("/get-or-create", chatController.getOrCreateChat.bind(chatController) as RequestHandler);
chatRouter.get("/:chatId", chatController.getChatById.bind(chatController) as RequestHandler);
chatRouter.put("/:chatId/last-message", chatController.updateLastMessage.bind(chatController) as RequestHandler);
chatRouter.put("/:chatId/increment-unread", chatController.incrementUnreadCount.bind(chatController) as RequestHandler);
chatRouter.put("/:chatId/reset-unread", chatController.resetUnreadCount.bind(chatController) as RequestHandler);
chatRouter.delete("/:chatId", chatController.deleteChat.bind(chatController) as RequestHandler);
// GET /chats/search?query=searchTerm&searcherId=userId&searcherRole=User&page=1&limit=20
chatRouter.get("/search", chatController.searchChats.bind(chatController) as RequestHandler);
chatRouter.get("/unread-count/:userId/:role", chatController.getTotalUnreadCount.bind(chatController) as RequestHandler);
chatRouter.get("/users/:userId/chats", chatController.getUserChats.bind(chatController) as RequestHandler);
chatRouter.get("/shops/:shopId/chats", chatController.getShopChats.bind(chatController) as RequestHandler);

export { chatRouter };