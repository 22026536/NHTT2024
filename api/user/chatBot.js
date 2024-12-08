import express from "express";
import chatBot from "../../controllers/user/chatbot.js";

const routerChatBot = express.Router()
routerChatBot.post("/",chatBot)

export default routerChatBot; 