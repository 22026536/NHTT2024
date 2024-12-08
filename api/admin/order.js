import express from "express";

import * as controller from "../../controllers/admin/order.js";

const orderRoutes = express.Router()

orderRoutes.get("/", controller.index);

orderRoutes.get("/detail/:orderId", controller.detail);

// orderRoutes.post("/create", controller.create);

// orderRoutes.patch("/edit/:orderId", controller.edit);

orderRoutes.delete("/delete/:orderId", controller.deleteItem);

export default orderRoutes;