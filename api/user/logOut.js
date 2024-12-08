import express from "express";
import logOut from "../../controllers/user/logOut.js";

const routerLogOut = express.Router()
routerLogOut.post("/",logOut)

export default routerLogOut;