import express from "express";
import { likeCheck, unLike, Like } from "../../controllers/user/like.js";

const routerLike = express.Router()
routerLike.post("/likeCheck/film_id=:film_id", likeCheck)
routerLike.post("/unlike/film_id=:film_id", unLike)
routerLike.post("/film_id=:film_id", Like)
export default routerLike;