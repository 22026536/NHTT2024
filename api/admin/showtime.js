import express from "express";

import * as controller from "../../controllers/admin/showtime.js";

const showTimeRoutes = express.Router()

showTimeRoutes.get("/", controller.index);

showTimeRoutes.get("/detail/:showTimeId", controller.detail);

showTimeRoutes.get("/create", controller.create)

showTimeRoutes.post("/create", controller.createPost);

showTimeRoutes.get("/edit/:showTimeId", controller.edit);

showTimeRoutes.patch("/edit/:showTimeId", controller.editPatch);

showTimeRoutes.delete("/delete/:showTimeId", controller.deleteItem);

export default showTimeRoutes;