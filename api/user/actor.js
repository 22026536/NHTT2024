import express from "express";
import { actor} from "../../controllers/user/actor.js";
const routerActor = express.Router()
routerActor.post('/actor_id=:actor_id', actor) 

export default routerActor