import express from "express";
import { protectRoute } from "../middleware/auth";
import { getMessages, getUsersForSidebar ,sendMeessage } from "../controllers/messageController";

const messageRouter = express.Router();
messageRouter.get("/users", protectRoute,getUsersForSidebar);
messageRouter.get("/:id", protectRoute,getMessages);
messageRouter.put("/mark/:id", protectRoute,markMessaageAsSeen);
messageRouter.post("/send", protectRoute, sendMeessage);

export default messageRouter;