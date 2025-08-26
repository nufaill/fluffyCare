import { RequestHandler, Router } from "express";
import { chatDependencies } from "../di/chatInjection";


const router = Router();

const { chatController } = chatDependencies();

router.post("/", chatController.createChat.bind(chatController) as RequestHandler);
router.post("/get-or-create", chatController.getOrCreateChat.bind(chatController) as RequestHandler);
router.get("/:chatId", chatController.getChatById.bind(chatController) as RequestHandler);
router.put("/:chatId/last-message", chatController.updateLastMessage.bind(chatController) as RequestHandler);
router.put("/:chatId/increment-unread", chatController.incrementUnreadCount.bind(chatController) as RequestHandler);
router.put("/:chatId/reset-unread", chatController.resetUnreadCount.bind(chatController) as RequestHandler);
router.delete("/:chatId", chatController.deleteChat.bind(chatController) as RequestHandler);
router.get("/search", chatController.searchChats.bind(chatController) as RequestHandler);
router.get("/unread-count/:userId/:role", chatController.getTotalUnreadCount.bind(chatController) as RequestHandler);
router.get("/users/:userId/chats", chatController.getUserChats.bind(chatController) as RequestHandler);
router.get("/shops/:shopId/chats", chatController.getShopChats.bind(chatController) as RequestHandler);


export default router;
