import express from "express";

import * as controller from "../../controllers/admin/new.js";

import { handleUpload, upload } from "../../middlewares/uploadCloud.js";

const newsRoutes = express.Router()

newsRoutes.get("/", controller.index);

newsRoutes.get("/detail/:newId", controller.detail);

newsRoutes.get("/create", controller.create);

newsRoutes.post(
    "/create", upload.single("new_img"), async (req, res, next) =>{
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
    controller.createPost);

newsRoutes.get("/edit/:newId", controller.edit);

newsRoutes.patch(
    "/edit/:newId", upload.single("new_img"), async (req, res, next) =>{
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

newsRoutes.delete("/delete/:newId", controller.deleteItem);

export default newsRoutes;