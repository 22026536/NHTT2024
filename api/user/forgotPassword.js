import express from "express";
import { forgotPassword, forgotPasswordChangePassword, forgotPasswordCheck } from "../../controllers/user/forgotPassword.js";

const routerForgotPassword = express.Router()
routerForgotPassword.post("/",forgotPassword)
routerForgotPassword.post("/check",forgotPasswordCheck)
routerForgotPassword.post("/changePassword",forgotPasswordChangePassword)
export default routerForgotPassword;