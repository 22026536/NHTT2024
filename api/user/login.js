import express from "express";
import login from "../../controllers/user/login.js";
const routerLogin = express.Router()

routerLogin.post("/", login)
export default routerLogin