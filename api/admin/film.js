import express from "express";

import * as controller from "../../controllers/admin/film.js";

import { handleUpload, upload } from "../../middlewares/uploadCloud.js";

const filmRoutes = express.Router()

filmRoutes.get("/", controller.index);

filmRoutes.get("/detail/:id", controller.detail);

filmRoutes.get("/create", controller.create);

filmRoutes.post(
    "/create", upload.single("film_img"), async (req, res, next) =>{
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
    controller.createPost
);

filmRoutes.get("/edit/:id", controller.edit);

filmRoutes.patch(
    "/edit/:id", upload.single("film_img"), async (req, res, next) =>{
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

filmRoutes.delete("/delete/:id", controller.deleteFilm);

export default filmRoutes;