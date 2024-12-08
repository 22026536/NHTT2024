import express from "express";

import * as controller from "../../controllers/admin/room.js";

const roomRoutes = express.Router()

roomRoutes.get("/", controller.index);

roomRoutes.get("/detail/:roomId", controller.detail);

roomRoutes.get("/create", controller.create)

roomRoutes.post("/create", controller.createPost);

roomRoutes.get("/edit/:roomId", controller.edit);

roomRoutes.patch("/edit/:roomId", controller.editPatch);

roomRoutes.delete("/delete/:roomId", controller.deleteItem);

export default roomRoutes;