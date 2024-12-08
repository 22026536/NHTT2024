import express from "express";
import routerActor from "./actor.js";
import routerChatBot from "./chatBot.js";
import routerCinema from "./cinema.js";
import routerDirector from "./director.js";
import routerFilm from "./film.js";
import routerForgotPassword from "./forgotPassword.js";
import routerLichChieu from "./lichChieu.js";
import routerLike from "./Like.js";
import routerLogin from "./login.js";
import routerLogOut from "./logOut.js";
import routerMuaVe from "./muaVe.js";
import routerOrders from "./orders.js";
import routerQRPayment from "./QRPayment.js";
import routerSignUp from "./signUp.js";
import routerUploadImage from "./uploadImage.js";
import routerUserInfo from "./userInfo.js";
import routerNew from "./new.js";
const router = express.Router()

router.use("/lichChieu", routerLichChieu)
router.use("/login",routerLogin)
router.use("/signUp",routerSignUp)
router.use("/uploadImage",routerUploadImage)
router.use("/payment",routerQRPayment)
router.use("/film",routerFilm)
router.use("/chatBot",routerChatBot)
router.use("/userInfo",routerUserInfo)
router.use("/logOut",routerLogOut)
router.use("/forgotPassword",routerForgotPassword)
router.use("/muaVe",routerMuaVe)
router.use("/orders",routerOrders)
router.use("/rap",routerCinema)


import connection from '../../models/SQLConnection.js';
router.use("/UpdateNew", async(req,res) => {
    try {
        const content = req.body.new_content
        const id = req.body.new_id
        const query =
            `Update news set new_content = ? where new_id = ?`

        connection.query(query, [content, id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database query failed' });
            }
    
            res.json(results);
        });

    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
})

router.use("/like",routerLike)
router.use("/actor", routerActor)
router.use("/director", routerDirector)
router.use("/new", routerNew)
export default router;