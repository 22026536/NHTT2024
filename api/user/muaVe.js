import express from "express";
import { popcornInfo, showSeat } from "../../controllers/user/muaVe.js";
const routerMuaVe = express.Router()
routerMuaVe.post("/showtime_id=:showtime_id",showSeat)
routerMuaVe.post("/popcornInfo",popcornInfo)
export default routerMuaVe