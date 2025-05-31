import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar ,sendMeessage , markMessaageAsSeen } from "../controllers/messageController.js";

const messageRouter = express.Router();
messageRouter.get("/users", protectRoute,getUsersForSidebar);
messageRouter.get("/:id", protectRoute,getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessaageAsSeen);
messageRouter.post("/send", protectRoute, sendMeessage);

export default messageRouter;