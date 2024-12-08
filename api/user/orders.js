import express from "express";
import { getLastestOrder, getOrders } from "../../controllers/user/orders.js";

const routerOrders = express.Router()
routerOrders.post("/",getOrders)
routerOrders.post("/getLastestOrder",getLastestOrder)
export default routerOrders;