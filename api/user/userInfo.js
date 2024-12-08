import express from "express";
import { userFilmLiked, userInfo, userInfoUpdate } from "../../controllers/user/userInfo.js";

const routerUserInfo = express.Router()
routerUserInfo.post("/",userInfo)
routerUserInfo.post("/update",userInfoUpdate)
routerUserInfo.post("/filmLiked",userFilmLiked)
export default routerUserInfo; 