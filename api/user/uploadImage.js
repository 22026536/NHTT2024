
import express from "express";

import { isTokenExpired, verifyToken } from "../../middlewares/JWT.js";
import { handleUpload, upload } from "../../middlewares/uploadCloud.js";
import connection from "../../models/SQLConnection.js";
const routerUploadImage = express.Router()


routerUploadImage.post("/", upload.single("image"), async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);

        const token = req.body.jwt;
        if(!token) {
            res.json({
                message: "Người dùng chưa đăng nhập",
                success: false
            });
        }
        if(isTokenExpired(token)){
            res.json({
                message: "Người dùng hết phiên đăng nhập",
                success: false
            });
        }

        const decode = verifyToken(token);
        const results = await connection.promise().query(`UPDATE users set user_img = '${cldRes.url}' where user_id = '${decode.id}'`)
        res.json({
            message: cldRes,
            success: true
        });
    } catch (error) {
        console.log(error);
        res.json({
            message: error.message,
            success: false
        });
    }
});

export default routerUploadImage;