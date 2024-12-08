import express from "express";

import * as controller from "../../controllers/admin/user.js";

import { handleUpload, upload } from "../../middlewares/uploadCloud.js";

const userRoutes = express.Router()

userRoutes.get("/", controller.index);

userRoutes.get("/detail/:userId", controller.detail);

// userRoutes.post("/create", controller.create);

userRoutes.patch(
    "/edit/:userId",  upload.single("user_img"), async (req, res, next) =>{
        res.locals.url = "";
        if(req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const cldRes = await handleUpload(dataURI);
            const url = cldRes.url;
            res.locals.url = url;
        }
        next();
    },
    controller.editPatch
);

userRoutes.delete("/delete/:userId", controller.deleteItem);

userRoutes.patch("/change-role/:userId", controller.changeRole);

userRoutes.patch("/change-status/:userId", controller.changeStatus);

export default userRoutes;