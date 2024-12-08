import express from "express";
import signUp from "../../controllers/user/signUp.js";
const routerSignUp = express.Router()

routerSignUp.post("/", signUp)
export default routerSignUp