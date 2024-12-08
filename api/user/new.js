import express from "express";
import { filmNew, newVietnam, newAboard, NewDetail, NewRelate } from "../../controllers/user/new.js";
const routerNew = express.Router()
routerNew.post('/', filmNew) 
routerNew.post('/vietnam',newVietnam) 
routerNew.post('/aboard', newAboard) 
routerNew.post('/new_id=:new_id', NewDetail)
routerNew.post('/film_id=:film_id', NewRelate)
export default routerNew